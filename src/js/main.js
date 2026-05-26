import {
  Cookies,
  initAll,
} from "@nationalarchives/frontend/nationalarchives/all.js";
import { GA4 } from "@nationalarchives/frontend/nationalarchives/analytics.mjs";

initAll();

const cookies = new Cookies(),
  setTheme = (theme) => {
    if (theme === "light") {
      document.documentElement.classList.remove("tna-template--dark-theme");
      document.documentElement.classList.remove("tna-template--system-theme");
    } else {
      document.documentElement.classList.add(`tna-template--${theme}-theme`);
    }
  };

if (cookies.exists("theme")) {
  setTheme(cookies.get("theme"));
} else {
  setTheme("system");
}

cookies.on("changePolicy", (data) => {
  if (Object.hasOwn(data, "settings")) {
    if (data.settings !== true) {
      cookies.delete("theme");
    }
  }
});

document.querySelectorAll("details[name]").forEach(($details) => {
  $details.addEventListener("toggle", (event) => {
    const name = $details.getAttribute("name");
    if (event.newState === "open") {
      document
        .querySelectorAll(`details[name=${name}][open]`)
        .forEach(($openDetails) => {
          if (!($openDetails === $details)) {
            $openDetails.removeAttribute("open");
          }
        });
    }
  });
});

const ga4Id = document.documentElement.getAttribute("data-ga4id");
if (ga4Id) {
  /* eslint-disable-next-line no-new */
  new GA4({ id: ga4Id });
}
