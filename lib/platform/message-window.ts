export type MessagePosition = { id: string; created_at: string };
export async function loadMessageWindow<T extends MessagePosition>(
  fetchPage: (before?: T) => Promise<T[]>,
  known: MessagePosition | null,
): Promise<T[]> {
  let page = await fetchPage();
  const rows = [...page];
  // Reconnect may span more than one page. Continue until we reach known history.
  while (known && page.length === 40) {
    const oldest = page[page.length - 1];
    if (
      oldest.created_at < known.created_at ||
      (oldest.created_at === known.created_at && oldest.id <= known.id)
    )
      break;
    page = await fetchPage(oldest);
    rows.push(...page);
  }
  return rows;
}
