module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("**/*.pdf");
  eleventyConfig.addGlobalData("siteContentLastUpdated", "14 September 2026");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "dist"
    },
    templateFormats: ["md", "njk", "html"]
  };
};