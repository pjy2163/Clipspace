export const ui = {
  shell: {
    app: "min-h-screen bg-[#f4f6f5] text-[#18211d]",
    container:
      "mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]",
  },
  panel: {
    base: "rounded-lg border border-[#d8dfda] bg-white shadow-sm",
    padded: "rounded-lg border border-[#d8dfda] bg-white p-4 shadow-sm",
    status: "rounded-lg border border-[#d8dfda] bg-[#eef5f1] p-4 text-sm leading-6 text-[#3f5a4e]",
  },
  button: {
    paste:
      "w-full rounded-lg border border-[#18211d] bg-[#18211d] px-4 py-4 text-left text-white shadow-sm transition hover:bg-[#27342e]",
    primary:
      "mt-3 w-full rounded-md bg-[#2f7d5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27684c]",
    quiet:
      "rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#b4c0b8] hover:text-[#18211d]",
    accent:
      "rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#64756d] transition hover:border-[#2f7d5b] hover:text-[#2f7d5b]",
    neutral:
      "rounded-md border border-[#d5ded8] px-3 py-2 text-sm font-medium text-[#43554d] transition hover:border-[#97aa9f] hover:bg-white",
    danger:
      "rounded-md border border-[#ecd2d2] px-3 py-2 text-sm font-medium text-[#9a3d3d] transition hover:bg-[#fff4f4]",
    iconDanger:
      "grid size-7 shrink-0 place-items-center rounded-md border border-[#e3cbc8] text-sm font-semibold text-[#9a3d3d] transition hover:bg-[#fff4f4]",
  },
  form: {
    label: "text-sm font-semibold text-[#18211d]",
    textarea:
      "mt-3 min-h-32 w-full resize-y rounded-md border border-[#cbd5cf] bg-[#fbfcfb] p-3 text-sm leading-6 outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]",
    input:
      "mt-3 h-11 w-full rounded-md border border-[#cbd5cf] bg-[#fbfcfb] px-3 text-sm outline-none transition focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]",
    memo:
      "mt-2 min-h-12 w-full resize-y rounded-md border border-[#d5ded8] bg-white px-3 py-2 text-sm leading-6 text-[#344a40] outline-none transition placeholder:text-[#9aaa9f] focus:border-[#2f7d5b] focus:ring-2 focus:ring-[#d9eadf]",
  },
  timeline: {
    panel: "min-h-[640px] min-w-0 rounded-lg border border-[#d8dfda] bg-white shadow-sm",
    header:
      "flex flex-col gap-3 border-b border-[#d8dfda] p-4 sm:flex-row sm:items-center sm:justify-between",
    empty: "grid min-h-[520px] place-items-center p-8 text-center",
    content: "space-y-8 p-3 sm:p-5",
    dayHeader: "mb-3 flex items-center gap-3",
    divider: "h-px flex-1 bg-[#e3e9e5]",
    grid: "grid gap-3 2xl:grid-cols-2",
  },
  clip: {
    card:
      "min-w-0 rounded-lg border border-[#d8dfda] bg-[#fcfdfc] p-4 transition hover:border-[#b7c5bd] hover:shadow-sm",
    header: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
    metaRow: "flex flex-wrap items-center gap-2",
    category:
      "rounded-md border border-[#e0e6e2] bg-white px-2 py-1 text-xs font-medium text-[#5d6f66]",
    imageFrame: "mt-4 overflow-hidden rounded-md border border-[#e2e8e4] bg-white",
    textFrame:
      "mt-4 max-h-72 min-h-24 overflow-auto rounded-md border border-[#e2e8e4] bg-white",
    memoItem: "flex items-start gap-2 rounded-md border border-[#dfe7e2] bg-white px-3 py-2",
  },
};
