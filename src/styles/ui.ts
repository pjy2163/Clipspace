export const ui = {
  shell: {
    app: "min-h-screen bg-[#f6f7f9] text-[#202124]",
    container:
      "mx-auto grid w-full max-w-[1440px] gap-3 px-4 py-3 sm:px-5 lg:grid-cols-[var(--workspace-columns)] lg:gap-0",
  },
  resize: {
    handle:
      "hidden cursor-col-resize touch-none rounded-md transition hover:bg-[#dbe3f2] active:bg-[#c8d5eb] lg:block",
    rail: "mx-auto block h-full w-px bg-[#d7dce5]",
  },
  panel: {
    base: "rounded-lg border border-[#e2e5ea] bg-white",
    padded: "rounded-lg border border-[#e2e5ea] bg-white p-3",
    status: "rounded-lg border border-[#d8e1f2] bg-[#f3f6fb] p-3 text-sm leading-6 text-[#3d4a5c]",
  },
  button: {
    paste:
      "w-full rounded-lg border border-[#202124] bg-[#202124] px-4 py-4 text-left text-white transition hover:bg-[#303134]",
    primary:
      "mt-3 w-full rounded-md bg-[#315fbd] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#274d9b]",
    quiet:
      "rounded-md border border-[#e0e4ea] bg-white px-3 py-2 text-sm font-medium text-[#5f6673] transition hover:border-[#c7cdd8] hover:text-[#202124]",
    accent:
      "rounded-md border border-[#d7dce5] bg-white px-2 py-1.5 text-xs font-medium text-[#5f6673] transition hover:border-[#9aa7bd] hover:text-[#202124]",
    neutral:
      "rounded-md border border-[#d7dce5] bg-white px-2 py-1.5 text-xs font-medium text-[#354052] transition hover:border-[#9aa7bd] hover:bg-[#f7f9fc]",
    danger:
      "rounded-md border border-[#ead6d6] bg-white px-2 py-1.5 text-xs font-medium text-[#9a3d3d] transition hover:bg-[#fff6f6]",
    iconDanger:
      "grid size-7 shrink-0 place-items-center rounded-md border border-[#e3cbc8] bg-white text-sm font-semibold text-[#9a3d3d] transition hover:bg-[#fff6f6]",
  },
  form: {
    label: "text-sm font-semibold text-[#202124]",
    textarea:
      "mt-3 min-h-24 w-full resize-y rounded-md border border-[#d7dce5] bg-[#fbfcff] p-3 text-sm leading-6 outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]",
    input:
      "mt-3 h-11 w-full rounded-md border border-[#d7dce5] bg-[#fbfcff] px-3 text-sm outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]",
    memo:
      "mt-2 min-h-10 w-full resize-y rounded-md border border-[#d7dce5] bg-white px-3 py-2 text-sm leading-5 text-[#3f4754] outline-none transition placeholder:text-[#9aa1ad] focus:border-[#315fbd] focus:ring-2 focus:ring-[#dbe6ff]",
  },
  timeline: {
    panel: "min-h-[640px] min-w-0 overflow-hidden rounded-lg border border-[#e2e5ea] bg-white",
    header:
      "flex flex-col gap-3 border-b border-[#e2e5ea] bg-[#fbfcff] p-3 sm:flex-row sm:items-center sm:justify-between",
    empty: "grid min-h-[520px] place-items-center p-8 text-center",
    content: "space-y-5 p-3 sm:p-4",
    dayHeader: "mb-2 flex items-center gap-3",
    divider: "h-px flex-1 bg-[#e5e8ee]",
    grid: "columns-1 gap-3 md:columns-2 lg:columns-3",
  },
  clip: {
    card:
      "mb-3 inline-block w-full min-w-0 break-inside-avoid rounded-lg border border-[#e2e5ea] bg-white p-3 transition hover:border-[#c9d0dc]",
    header: "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
    metaRow: "flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden",
    category:
      "truncate rounded-md border border-[#e3e7ee] bg-[#f8fafc] px-2 py-1 text-xs font-medium text-[#5f6673]",
    imageFrame: "mt-3 overflow-hidden rounded-md border border-[#e2e5ea] bg-[#f8fafc]",
    textFrame:
      "mt-3 max-h-36 min-h-14 overflow-auto rounded-md border border-[#e2e5ea] bg-[#fbfcff]",
    memoItem: "flex items-start gap-2 rounded-md border border-[#e3e7ee] bg-[#fbfcff] px-3 py-2",
  },
};
