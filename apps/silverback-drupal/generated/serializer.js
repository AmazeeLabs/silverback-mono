module.exports = {
  default(responses) {
    maskImageUrl(responses);
    return responses;
  },
};

// Image URLs contain current date, e.g.
// http://localhost:8888/sites/default/files/2021-01/image.jpg
function maskImageUrl(value) {
  if (value !== null && typeof value === "object") {
    if (value.__typename === "Image" && value.url) {
      value.url = value.url.replace(/\/files\/\d+-\d+\//, "/files/[date]/");
    }
    if (Array.isArray(value)) {
      value.map(maskImageUrl);
    } else {
      Object.values(value).map(maskImageUrl);
    }
  }
}
