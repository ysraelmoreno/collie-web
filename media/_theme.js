// Shared by every composition: ?theme=light swaps the Dark :root tokens for the Light ones (scripts/capture-gif.sh).
// GSAP cannot tween to var(--x): read a token's value with css("--x") when building the timeline.
const light = new URLSearchParams(location.search).get("theme") === "light";
document.addEventListener("DOMContentLoaded", () => {
  const vars = light
    ? "--bg:#f4f2ed;--surface:#fff;--surface-2:#ece9e2;--border:#dcd8cf;--fg:#15171c;--text2:#5a5d66;--accent:#2d69fd;--accent-soft:#4a5bd6;--success:#0f7a55;--warn:#a14a06;--on-accent:#fff;--dot:#dcd8cf;--shadow:rgba(21,23,28,.16);--tint:#e3e8ff"
    : "--tint:#2a3350";
  document.head.insertAdjacentHTML("beforeend", `<style>:root{${vars}}</style>`);
});
window.css = (name) => {
  const dark = { "--border": "#2e323b", "--accent": "#6e9bff", "--tint": "#2a3350" };
  const lite = { "--border": "#dcd8cf", "--accent": "#2d69fd", "--tint": "#e3e8ff" };
  return (light ? lite : dark)[name];
};
