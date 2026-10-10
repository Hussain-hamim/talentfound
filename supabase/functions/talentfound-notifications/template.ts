type Payload = {
  conversation: string;
  messages: {
    sender: string;
    body: string;
    brief?: { title?: string; description?: string } | null;
  }[];
};
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function renderNotification(payload: Payload, origin: string) {
  const link = `${origin.replace(/\/$/, "")}/dashboard/messages/${encodeURIComponent(payload.conversation)}`;
  const subject = `${payload.messages[0]?.sender || "Someone"} sent you a message on TalentFound`;
  const text =
    payload.messages
      .map(
        (m) =>
          `${m.sender}\n${m.body}${m.brief ? `\nInvitation: ${m.brief.title}\n${m.brief.description}` : ""}`,
      )
      .join("\n\n") +
    `\n\nContinue the conversation: ${link}\n\nManage email preferences: ${origin}/dashboard/settings\nPlease reply in TalentFound; replies to this email are not delivered.`;
  const html = `<div style="background:#151415;color:#f7f1ef;padding:40px 24px;font-family:Arial,sans-serif;max-width:600px;margin:auto"><div style="font-size:24px;font-weight:bold;margin-bottom:32px"><span style="color:#ff3317">[</span>talentfound<span style="color:#ff3317">]</span></div><h1 style="font-family:Georgia,serif;font-weight:normal">A conversation worth opening.</h1>${payload.messages.map((m) => `<div style="border-top:1px solid #403536;padding:20px 0"><strong>${escapeHtml(m.sender)}</strong><p style="white-space:pre-wrap;line-height:1.7">${escapeHtml(m.body)}</p>${m.brief ? `<h3>${escapeHtml(m.brief.title || "Project invitation")}</h3><p style="white-space:pre-wrap">${escapeHtml(m.brief.description || "")}</p>` : ""}</div>`).join("")}<a href="${escapeHtml(link)}" style="display:inline-block;background:#ff3317;color:white;padding:14px 20px;text-decoration:none;margin:20px 0">Continue the conversation ↗</a><p style="color:#aaa5a7;font-size:12px;line-height:1.8">Reply in TalentFound; replies to this email aren’t delivered.<br/><a style="color:#aaa5a7" href="${escapeHtml(origin)}/dashboard/settings">Manage notification preferences</a></p></div>`;
  return { subject, text, html };
}
