module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("**/*.pdf");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "dist"
    },
    templateFormats: ["md", "njk", "html"]
  };
};