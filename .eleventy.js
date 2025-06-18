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

  eleventyConfig.addCollection("sitemapPages", (collectionsApi) => {
    const allPages = collectionsApi
      .getFilteredByGlob(["**/*.md"])
      .toSorted((a, b) => {
        const urlA = a.url;
        const urlB = b.url;
        if (urlA === urlB) {
          return a.url.localeCompare(b.url);
        }
        return urlA - urlB;
      });
    const allPagesByUrl = Object.fromEntries(
      new Map(allPages.map((page) => [page.url, page])),
    );
    const allPagesHierarchy = { title: "Home", url: "/", children: [] };
    allPages
      .filter((page) => page.url !== "/")
      .forEach((page) =>
        page.url
          .replace(/^\//, "")
          .replace(/\/$/, "")
          .split("/")
          .reduce(
            (r, urlPart) =>
              r.children.find((child) => child.urlPart === urlPart) ||
              r.children.push({
                title: allPagesByUrl[page.url].data.title,
                description: allPagesByUrl[page.url].data.description || "",
                url: page.url,
                urlPart: urlPart,
                children: [],
              }),
            allPagesHierarchy,
          ),
      );
    return allPagesHierarchy;
  });
  eleventyConfig.addCollection("headerNavigation", (collectionsApi) => {
    return collectionsApi
      .getFilteredByGlob(["**/*.md"])
      .filter((page) => page.data.showInHeaderNavigation === true)
      .sort((a, b) => {
        const orderA = a.data.headerNavigationOrder || 999;
        const orderB = b.data.headerNavigationOrder || 999;
        if (orderA === orderB) {
          return a.inputPath.localeCompare(b.inputPath);
        }
        return orderA - orderB;
      });
  });
  eleventyConfig.addCollection("footerNavigation", (collectionsApi) => {
    return collectionsApi
      .getFilteredByGlob(["**/*.md"])
      .filter((page) => page.data.showInFooterNavigationGroup !== undefined)
      .sort((a, b) => {
        const orderA = a.data.footerNavigationOrder || 999;
        const orderB = b.data.footerNavigationOrder || 999;
        if (orderA === orderB) {
          return a.inputPath.localeCompare(b.inputPath);
        }
        return orderA - orderB;
      })
      .reduce((groups, page) => {
        if (!groups.hasOwnProperty(page.data.showInFooterNavigationGroup)) {
          groups[page.data.showInFooterNavigationGroup] = [];
        }
        groups[page.data.showInFooterNavigationGroup].push(page);
        return groups;
      }, {});
  });

  return {
    markdownTemplateEngine: "njk",
  };
};
