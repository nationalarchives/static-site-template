---
title: Sitemap
layout: simple.njk
eleventyExcludeFromCollections: true
---

{% macro sitemapPage(page) %}

<li><a href="{{ BASE_URL }}{{ page.url }}">{{ page.title }}</a>{% if page.description %} - {{ page.description }}{% endif %}
{% if page.children.length %}
<ul class="tna-ul">
{% for child in page.children %}
{{ sitemapPage(child)}}
{% endfor %}
</ul>
{% endif %}
</li>
{% endmacro %}

These are the pages available on {{ siteSettings.name }}.

<ul class="tna-ul">
<li><a href="{{ BASE_URL }}{{ collections.sitemapPages.url }}">{{ collections.sitemapPages.title }}</a>
{% if collections.sitemapPages.children.length %}
{% for page in collections.sitemapPages.children %}
{{ sitemapPage(page)}}
{% endfor %}
{% endif %}
</li>
</ul>
