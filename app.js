      let oz = 0;
      let goalOz = 128;
      let insightsChart = null;
      let chartRange = "day";

      function saveState() {
        localStorage.setItem('water_goal', String(goalOz));
      }


      function loadState() {
        const today = WT.getTodayTotal();
        oz = today.totalOz;

        const g = localStorage.getItem("water_goal");
        goalOz = g ? Math.max(1, parseInt(g, 10) || 128) : 128;
      }

      function goToPage(i) {
        const pager = document.getElementById('pager');
        // Make the destination focusable before scrolling to it.
        pager.querySelectorAll('.page').forEach(page => page.inert = false);
        pager.style.height = `${pager.children[i].offsetHeight}px`;
        pager.scrollTo({ left: pager.clientWidth * i, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }


      function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
      }

      function getChartTheme() {
        const css = getComputedStyle(document.documentElement);
        return {
          text:
            css.getPropertyValue("--muted").trim() ||
            "rgba(255,255,255,.65)",
          grid: "rgba(255,255,255,0.10)",
          blue1: css.getPropertyValue("--blue1").trim() || "#4cc9f0",
          blue2: css.getPropertyValue("--blue2").trim() || "#4895ef",
        };
      }

      function dayKeyToDate(dayKey) {
        const [y, m, d] = dayKey.split("-").map(Number);
        return new Date(y, m - 1, d, 12, 0, 0, 0);
      }

      function makeDayKey(y, m, d) {
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
      }

      function formatTime(ts) {
        return new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(ts));
      }

      function getDayChartData(state, dayKey) {
        const entries = state.entries[dayKey] || [];
        if (!entries.length) {
          return {
            labels: ["No entries"],
            datasets: [
              {
                label: "Added (oz)",
                data: [0],
                borderRadius: 8,
              },
            ],
            stats: "Today: no entries yet",
            optionsPatch: {
              scales: {
                y: { beginAtZero: true, suggestedMax: goalOz },
              },
            },
          };
        }

        return {
          labels: entries.map((e) => formatTime(e.ts)),
          datasets: [
            {
              label: "Added (oz)",
              data: entries.map((e) => e.oz),
              borderRadius: 8,
            },
          ],
          stats: `Today: ${entries.length} entries • ${Math.round(oz)} oz total`,
          optionsPatch: {
            scales: {
              y: { beginAtZero: true },
            },
          },
        };
      }

      function getWeekChartData(state, dayKey) {
        const current = dayKeyToDate(dayKey);
        const sunday = new Date(current);
        sunday.setDate(current.getDate() - current.getDay());

        const labels = [
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ];
        const values = [];

        for (let i = 0; i < 7; i++) {
          const dt = new Date(sunday);
          dt.setDate(sunday.getDate() + i);
          const key = makeDayKey(
            dt.getFullYear(),
            dt.getMonth() + 1,
            dt.getDate(),
          );
          values.push(state.dailyTotals[key] || 0);
        }

        const total = values.reduce((a, b) => a + b, 0);
        const avg = Math.round((total / 7) * 10) / 10;

        return {
          labels,
          datasets: [
            {
              label: "Water (oz)",
              data: values,
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
          stats: `Week total: ${Math.round(total)} oz • Avg: ${avg} oz/day`,
          optionsPatch: {
            scales: {
              y: { beginAtZero: true },
            },
          },
        };
      }

      function getMonthChartData(state, dayKey) {
        const current = dayKeyToDate(dayKey);
        const year = current.getFullYear();
        const month = current.getMonth() + 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const starts = [1, 8, 15, 22, 29].filter(
          (d) => d <= daysInMonth,
        );

        const labels = starts.map((d) => String(d));
        const values = starts.map((start) => {
          const end = Math.min(start + 6, daysInMonth);
          let sum = 0;
          let count = 0;
          for (let d = start; d <= end; d++) {
            sum += state.dailyTotals[makeDayKey(year, month, d)] || 0;
            count++;
          }
          return Math.round((sum / count) * 10) / 10;
        });

        const avg =
          values.length > 0
            ? Math.round(
                (values.reduce((a, b) => a + b, 0) / values.length) *
                  10,
              ) / 10
            : 0;

        return {
          labels,
          datasets: [
            {
              label: "Avg oz/day",
              data: values,
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
          stats: `Month checkpoints avg: ${avg} oz/day`,
          optionsPatch: {
            scales: {
              y: { beginAtZero: true },
            },
          },
        };
      }

      function getYearChartData(state, dayKey) {
        const current = dayKeyToDate(dayKey);
        const year = current.getFullYear();
        const currentMonth = current.getMonth() + 1;
        const currentDay = current.getDate();
        const labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const values = labels.map((_, idx) => {
          const month = idx + 1;
          let days = new Date(year, month, 0).getDate();
          if (month > currentMonth) return 0;
          if (month === currentMonth) days = currentDay;
          let sum = 0;
          for (let d = 1; d <= days; d++) {
            sum += state.dailyTotals[makeDayKey(year, month, d)] || 0;
          }
          return Math.round((sum / days) * 10) / 10;
        });

        const ytdAvg =
          currentMonth > 0
            ? Math.round(
                (values
                  .slice(0, currentMonth)
                  .reduce((a, b) => a + b, 0) /
                  currentMonth) *
                  10,
              ) / 10
            : 0;

        return {
          labels,
          datasets: [
            {
              label: "Avg oz/day",
              data: values,
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
          stats: `Year-to-date monthly avg: ${ytdAvg} oz/day`,
          optionsPatch: {
            scales: {
              y: { beginAtZero: true },
            },
          },
        };
      }

      function getRangeData(range) {
        const state = WT.loadState();
        const dayKey = WT.getTodayTotal().dayKey;
        if (range === "week") return getWeekChartData(state, dayKey);
        if (range === "month")
          return getMonthChartData(state, dayKey);
        if (range === "year") return getYearChartData(state, dayKey);
        return getDayChartData(state, dayKey);
      }

      function setTabActive(range) {
        ["day", "week", "month", "year"].forEach((id) => {
          const el = document.getElementById(`tab-${id}`);
          if (!el) return;
          el.classList.toggle("active", id === range);
          el.setAttribute("aria-pressed", String(id === range));
        });
      }

      function buildInsightsChart() {
        const canvas = document.getElementById("insightsChart");
        if (!canvas) return;
        if (typeof Chart === 'undefined') { document.getElementById('chart-fallback').hidden = false; canvas.hidden = true; updateWeeklyHeader(); return; }
        const theme = getChartTheme();
        const rangeData = getRangeData(chartRange);

        const chartData = {
          labels: rangeData.labels,
          datasets: rangeData.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor:
              dataset.backgroundColor ||
              ((ctx) => {
                const chart = ctx.chart;
                const area = chart.chartArea;
                if (!area) return theme.blue2;
                const g = chart.ctx.createLinearGradient(
                  0,
                  area.bottom,
                  0,
                  area.top,
                );
                g.addColorStop(0, theme.blue2);
                g.addColorStop(1, theme.blue1);
                return g;
              }),
            borderColor: dataset.borderColor || "transparent",
          })),
        };

        const baseOptions = {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320, easing: "easeOutCubic" },
          indexAxis: "x",
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              callbacks: {
                label: (c) => {
                  const value =
                    typeof c.parsed.y === "number"
                      ? c.parsed.y
                      : c.parsed.x;
                  return `${value} oz`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: theme.text, font: { weight: 700 } },
            },
            y: {
              beginAtZero: true,
              grid: { color: theme.grid },
              ticks: { color: theme.text },
            },
          },
          ...rangeData.optionsPatch,
        };

        // Keep theme colors when applying range-specific axis settings.
        baseOptions.scales = {
          x: { grid: { display: false }, ticks: { color: theme.text, font: { weight: 600 } } },
          y: { ...(rangeData.optionsPatch?.scales?.y || {}), beginAtZero: true, grid: { color: theme.grid }, ticks: { color: theme.text } },
        };
        if (!insightsChart) {
          insightsChart = new Chart(canvas, {
            type: "bar",
            data: chartData,
            options: baseOptions,
          });
          updateWeeklyHeader();
          return;
        }

        insightsChart.data.labels = chartData.labels;
        insightsChart.data.datasets = chartData.datasets;
        insightsChart.options = baseOptions;
        insightsChart.update();
        updateWeeklyHeader();
      }

      function updateWeeklyHeader() {
        const ws = document.getElementById("weekStats");
        if (ws) ws.textContent = getRangeData(chartRange).stats;

        const g2 = document.getElementById("goalText2");
        if (g2) g2.textContent = String(goalOz);
      }

      function setChartRange(range) {
        chartRange = range;
        setTabActive(range);
        buildInsightsChart();
      }

      function updateUI() {
        const { remaining, percent, ringDegrees } = WaterView.summary(oz, goalOz);
        const fmt = WaterView.ounces;
        document.getElementById('goalText1').textContent = fmt(goalOz);
        document.getElementById('bigNumber').textContent = fmt(oz);
        document.getElementById('progressText').textContent = `${fmt(oz)} / ${fmt(goalOz)} oz`;
        document.getElementById('percentPill').textContent = `${percent}%`;
        document.getElementById('remaining-label').textContent = remaining ? 'Room for more' : 'Daily goal reached';
        document.getElementById('remaining-number').replaceChildren(document.createTextNode(fmt(remaining)), Object.assign(document.createElement('span'), { textContent: ' oz' }));
        document.getElementById('remainingText').textContent = remaining ? `${fmt(remaining)} oz to go` : 'Every sip adds up.';
        document.getElementById('water-ring').style.setProperty('--progress', `${ringDegrees}deg`);
        document.getElementById('fill').style.width = `${Math.min(100, percent)}%`;
        document.getElementById('encouragement').textContent = !oz ? 'A fresh start.' : remaining ? 'You’re finding your flow.' : 'A little goal. A good feeling.';
        document.getElementById('encouragement-copy').textContent = !oz ? 'Your next glass is a good place to begin.' : remaining ? 'Small sips, at your own pace. Keep it simple.' : 'Your daily target is complete. Make it your own pace.';
        const { dayKey } = WT.getTodayTotal();
        document.getElementById('today-label').textContent = dayKeyToDate(dayKey).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
        const entries = WT.loadState().entries[dayKey] || [];
        document.getElementById('entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'sip' : 'sips'}`;
        const list = document.getElementById('sip-log'); list.replaceChildren();
        if (!entries.length) {
          const empty = document.createElement('div'); empty.className = 'empty-log';
          empty.innerHTML = '<strong>Your day is still beginning.</strong>Tap a glass or bottle above to log your first sip.'; list.append(empty);
        } else [...entries].reverse().forEach(entry => {
          const row = document.createElement('div'); row.className = 'log-entry';
          row.innerHTML = '<span><span class="log-icon"><svg class="icon"><use href="#drop"/></svg></span><span class="log-time"></span></span><strong></strong>';
          row.querySelector('.log-time').textContent = formatTime(entry.ts);
          row.querySelector('strong').replaceChildren(document.createTextNode(`+${fmt(entry.oz)} `), Object.assign(document.createElement('small'), { textContent:'oz' })); list.append(row);
        });
        document.getElementById('status').textContent = `${navigator.onLine ? 'Saved on your device' : 'Offline · saved on your device'} · refreshes at 5:00 AM`;
        document.getElementById('undo-button')?.toggleAttribute('disabled', !entries.length);
        buildInsightsChart();
      }


      function addWater(amount) {
        try { oz = WT.addWater(amount).totalOz; updateUI(); showToast(`Added ${amount} oz. A little sip of progress.`); }
        catch (error) { showToast('Could not save your sip. Your device storage may be full.'); }
      }


      function undoLast() {
        try { const result = WT.undoLastEntry(); oz = result.totalOz; updateUI(); showToast(result.undone ? `Removed the last ${WaterView.ounces(result.undone.oz)} oz sip.` : 'No sips to undo today.'); }
        catch (error) { showToast('Could not save this change. Please try again.'); }
      }


      function reset() { document.getElementById('reset-dialog').showModal(); }


      function setGoalPrompt() {
        const input = document.getElementById('goal-input'); input.value = String(goalOz);
        document.getElementById('goal-error').textContent = '';
        document.getElementById('goal-dialog').showModal(); input.focus();
      }
      let toastTimeout;
      function showToast(message) {
        const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('visible');
        clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3200);
      }


      document.addEventListener("DOMContentLoaded", () => {
        loadState();
        updateUI();
        setChartRange('day');
        document.getElementById('goal-form').onsubmit = event => {
          event.preventDefault(); const input = document.getElementById('goal-input');
          if (!input.reportValidity()) return;
          const previous = goalOz; goalOz = Number(input.value);
          try { saveState(); updateUI(); document.getElementById('goal-dialog').close(); showToast('Your daily goal is saved.'); }
          catch (error) { goalOz = previous; document.getElementById('goal-error').textContent = 'Could not save your goal. Please check device storage.'; }
        };
        document.getElementById('confirm-reset').onclick = () => {
          try { oz = WT.resetToday().totalOz; updateUI(); document.getElementById('reset-dialog').close(); showToast('Today is reset. Your earlier days are still saved.'); }
          catch (error) { document.getElementById('reset-dialog').close(); showToast('Could not reset today. Please try again.'); }
        };
        let scrollTimeout;
        const pager = document.getElementById('pager');
        pager.addEventListener('scroll', () => {
          clearTimeout(scrollTimeout); scrollTimeout = setTimeout(() => {
            const index = Math.round(pager.scrollLeft / pager.clientWidth);
            ['nav-today','nav-insights'].forEach((id,i) => { const nav = document.getElementById(id); nav.classList.toggle('active',i === index); if (i === index) nav.setAttribute('aria-current','page'); else nav.removeAttribute('aria-current'); });
            pager.querySelectorAll('.page').forEach((page,i) => page.inert = i !== index);
            pager.style.height = `${pager.children[index].offsetHeight}px`;
          },100);
        });
        const sizePager = () => { const index = Math.min(1,Math.round(pager.scrollLeft / pager.clientWidth)); pager.style.height = `${pager.children[index].offsetHeight}px`; };
        new ResizeObserver(sizePager).observe(document.getElementById('today-page'));
        new ResizeObserver(sizePager).observe(document.getElementById('insights-page'));
        sizePager();
        const refresh = () => { loadState(); updateUI(); };
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
        window.addEventListener('online',refresh); window.addEventListener('offline',refresh);
        window.addEventListener('storage',refresh);
        setInterval(refresh,60000);
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(reg => { if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING'); reg.addEventListener('updatefound', () => { const worker = reg.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) worker.postMessage('SKIP_WAITING'); }); }); }).catch(() => {});
      });
