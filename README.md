# TNA Static Site

## Quickstart

```sh
# Node version
nvm use

# Install dependencies
npm install

# Start development server
npm run dev
```

View the site at [localhost:8080](http://localhost:8080/)

## Building your site

You can build your site for deployment with `npm run build` which creates a `dist` directory with the static content in.

### Boilerplate content

This repo contains four basic pages to start you off with:

- `src/index.md` - the home page
- `src/accessibility/index.md` - the accessibility statement
- `src/cookies/index.md` - the cookie policies page with functionality to change cookie preferences
- `src/sitemap/index.md` - a basic HTML sitemap containing all the pages

### Site settings

Edit the details in `src/_data/siteSettings.json` to change some basic aspects of the site.

| Property                | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `name`                  | The name of the site that appears in the title of the pages as well as the cookie banner |
| `url`                   | Used on the default cookies page                                                         |
| `cookiesDomain`         | Defines the domain to which cookies are set                                              |
| `cookiePreferencesUrl`  | Defines the URL where cookie preferences can be set                                      |
| `headerStrapline`       | Adds a short strapline to the logo in the header                                         |
| `includeLogoAdornments` | If `true`, add adornments to the logo in the header for events throughout the year       |
| `404ContactUrl`         | The URL to use for the "contact us" link in the default 404 error page                   |
| `googleAnalytics4Id`    | The ID of a Google Analytics 4 property to enable tracking                               |

### Adding pages

Add a markdown file to the `src` directory to create a new page. Page paths will get normalised to permalinks during build:

| File                   | Path        |
| ---------------------- | ----------- |
| `src/my-page.md`       | `/my-page/` |
| `src/my-page/index.md` | `/my-page/` |

#### Markdown properties

At the top of the markdown file, you can set some page properties. For example:

```md
---
title: My page
layout: simple.njk
---

Markdown content goes here
```

The available properties are:

| Property                               | Type    | Purpose                                                      |
| -------------------------------------- | ------- | ------------------------------------------------------------ |
| `title` **(required)**                 | String  | Used in the `<title>` element                                |
| `layout` **(required)**                | String  | The layout template to use, found in `src/_layouts`          |
| `description`                          | String  | If set, adds a meta description to the page                  |
| [`date`](#page-dates)                  | String  | Set the last updated date of the page in the meta tags       |
| [`themeAccent`](#theme-accent-colours) | String  | Set the accent colour of the page                            |
| `showInHeaderNavigation`               | Boolean | If `true`, add the page to the header navigation             |
| `headerNavigationOrder`                | Integer | Set the order of the page if used in the header navigation   |
| `showInFooterNavigationGroup`          | String  | The name of the footer navigation group to show this link in |
| `footerNavigationOrder`                | Integer | Set the order of the page if used in the footer navigation   |
| `eleventyExcludeFromCollections`       | Boolean | If `true`, exclude from all navigations and sitemaps         |

##### Page dates

See [11ty documentation on dates](https://www.11ty.dev/docs/dates/) for the available options for page date.

The suggested value is `git Last Modified`.

##### Theme accent colours

The `themeAccent` can be set to `black`, `pink`, `orange`, `yellow`, `green` or `blue`. These accent colours are listed under ["Accent colours" on the National Archives Design System](https://design-system.nationalarchives.gov.uk/styles/colours/#accent-colours).

### Using TNA Frontend components

You can use any component from TNA Frontend as listed in the [Components section of the National Archives Design System](https://design-system.nationalarchives.gov.uk/components/) directly in a markdown file.

The code should be identical to the examples given in the design system. For instance, to display a [button](https://design-system.nationalarchives.gov.uk/components/button/):

```nunjucks
{% from "nationalarchives/components/button/macro.njk" import tnaButton %}

{{ tnaButton({
  text: "Button",
  href: "#"
}) }}
```

### CSS

There is a file set up to add custom styles in: `src/css/modules/_custom.scss`. Styles added here will be available on all pages.

**TODO:** For more information on how to use TNA Frontend CSS, see [Using CSS tools in the TNA Frontend documentation](https://nationalarchives.github.io/tna-frontend-docs/using/css-tools/).

### JavaScript

The main JavaScript file can be edited to add additional functionality: `src/js/main.js`.

JavaScript will be transpiled down to ES2020 to ensure compatibility with all [supported browsers](https://nationalarchives.github.io/engineering-handbook/technology/standards/browser-support/).

### Assets

Any files added to `src/assets` will get output to the `assets` directory in the final build.

When referencing assets in the templates or pages, prefix the path with the `BASE_PATH` variable (defaults to `/`) which ensures that the site still works when deployed to paths within a domain.

### New layouts

Add new page layout templates to `src/_layouts`. You can then use these by setting the `layout` property in markdown files.

The blocks and variables available in the base page template are listed on ["Page template" in the National Archives Design System](https://design-system.nationalarchives.gov.uk/styles/page-template/).

### Customise TNA Frontend components

To customise any TNA Frontend components, make a file in the `_includes` directory that mirrors the component template. For example, the header component; `src/_includes/nationalarchives/components/header/template.njk`.

You can copy in the [default header template from TNA Frontend](https://github.com/nationalarchives/tna-frontend/blob/main/src/nationalarchives/components/header/template.njk) and edit it to suit your needs.

> ⚠️ Doing this will mean you don't get the latest updates when components are changed in TNA Frontend.

### Updating TNA Frontend

Running `npm update` will update all your dependencies including TNA Frontend.

Review the [TNA Frontend releases](https://github.com/nationalarchives/tna-frontend/releases) and [TNA Frontend changelog](https://github.com/nationalarchives/tna-frontend/blob/main/CHANGELOG.md) to keep track of what has changed.
