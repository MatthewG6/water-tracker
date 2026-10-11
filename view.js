(() => {
  const ounces = value => Number(Number(value).toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const summary = (total, goal) => ({ remaining: Math.max(0, Math.round((goal - total) * 100) / 100), percent: Math.floor(total / goal * 100), ringDegrees: Math.min(360, Math.max(0, total / goal * 360)) });
  window.WaterView = { ounces, summary };
})();
