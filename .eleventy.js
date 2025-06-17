const path = require("node:path");
const sass = require("sass");
const esbuild = require("esbuild");
const Nunjucks = require("nunjucks");
const packageInfo = require("./package-lock.json");
const markdownItClass = require("markdown-it-class");

module.exports = async function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("dist");
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.setDataDirectory("_data");

  eleventyConfig.setTemplateFormats("html,md");
  // eleventyConfig.markdownTemplateEngine = "njk";

  eleventyConfig.amendLibrary("md", (mdLib) =>
    mdLib.use(markdownItClass, {
      h1: ["tna-heading-xl"],
      h2: ["tna-heading-l"],
      h3: ["tna-heading-m"],
      h4: ["tna-heading-s"],
      h5: ["tna-heading-s"],
      h6: ["tna-heading-s"],
      ul: ["tna-ul"],
      ol: ["tna-ol"],
      table: ["tna-table"],
      thead: ["tna-table__head"],
      tbody: ["tna-table__body"],
      tr: ["tna-table__row"],
      th: ["tna-table__header"],
      td: ["tna-table__cell"],
    }),
  );

  let nunjucksEnvironment = new Nunjucks.Environment([
    new Nunjucks.FileSystemLoader("src/_includes"),
    new Nunjucks.FileSystemLoader("node_modules/@nationalarchives/frontend"),
  ]);
  eleventyConfig.setLibrary("njk", nunjucksEnvironment);
  eleventyConfig.addNunjucksFilter("iso8601", (date) => {
    return new Date(date).toISOString();
  });
  eleventyConfig.addNunjucksFilter("prettyDate", (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });
  eleventyConfig.addNunjucksFilter("slugify", (text) =>
    encodeURIComponent(
      text
        .toLowerCase()
        .trim()
        .replace(/[\s\.]/g, "-"),
    ),
  );

  eleventyConfig.addGlobalData(
    "TNA_FRONTEND_VERSION",
    () =>
      packageInfo.packages["node_modules/@nationalarchives/frontend"].version,
  );
  eleventyConfig.addGlobalData("BASE_PATH", () => {
    const basePath = process.env.BASE_PATH || "";
    if (!basePath || basePath === "/") {
      return "/";
    }
    return "/" + basePath.replace(/^\//, "").replace(/\/$/, "") + "/";
  });

  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "node_modules/@nationalarchives/frontend/nationalarchives/assets/fonts":
      "assets/fonts",
    "node_modules/@nationalarchives/frontend/nationalarchives/assets/images":
      "assets/images",
  });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false,
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }
      const result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", "node_modules"],
        style: "compressed",
        sourceMap: true,
        quietDeps: true,
        silenceDeprecations: ["import"],
      });
      this.addDependencies(inputPath, result.loadedUrls);
      return async (data) => {
        return result.css;
      };
    },
  });

  eleventyConfig.addTemplateFormats("js");
  eleventyConfig.addExtension("js", {
    outputFileExtension: "js",
    useLayouts: false,
    compile: async (content, path) => {
      if (path !== "./src/js/main.js") {
        return;
      }
      return async () => {
        let output = await esbuild.build({
          target: "es2020",
          entryPoints: [path],
          minify: true,
          bundle: true,
          write: false,
        });
        return output.outputFiles[0].text;
      };
    },
  });

  eleventyConfig.addCollection("allPages", function (collectionsApi) {
    return collectionsApi.getFilteredByGlob(["**/*.md"]).sort(function (a, b) {
      const depthA = a.inputPath.split("/").length - 1;
      const depthB = b.inputPath.split("/").length - 1;
      if (depthA === depthB) {
        return a.inputPath.localeCompare(b.inputPath); // sort by path - ascending
      }
      return depthA - depthB;
    });
  });

  return {
    markdownTemplateEngine: "njk",
  };
};
