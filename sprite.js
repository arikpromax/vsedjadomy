// Іконки сайту (один спрайт для всіх сторінок)
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></symbol>
    <symbol id="i-cart" viewBox="0 0 24 24"><path d="M3 4h2.5l2.2 11h10.8L21 7H7"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></symbol>
    <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 3.5h3.5l1.6 4.4-2.2 1.5a11 11 0 0 0 6.7 6.7l1.5-2.2 4.4 1.6V19a1.6 1.6 0 0 1-1.7 1.6C10.4 20 4 13.6 3.4 5.2A1.6 1.6 0 0 1 5 3.5z"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></symbol>
    <symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9.5l6 6 6-6"/></symbol>
    <symbol id="i-left" viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></symbol>
    <symbol id="i-right" viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/></symbol>
    <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
    <symbol id="i-ig" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6"/></symbol>
    <symbol id="i-tg" viewBox="0 0 24 24"><path d="M21 4L3 11.2l5.6 2 2 6.3 3.3-3.8 4.9 3.6zM8.6 13.2l9.4-6.4-7.4 7.6"/></symbol>
    <symbol id="i-img" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="M3.5 18l5.5-5.5 4 4 2.5-2.5 5 5"/></symbol>
    <symbol id="i-truck" viewBox="0 0 24 24"><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
    <symbol id="i-store" viewBox="0 0 24 24"><path d="M3.5 9.5V20h17V9.5M2.5 9.5l2-5.5h15l2 5.5zM9.5 20v-5.5h5V20"/></symbol>
    <symbol id="i-parts" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M8 14h2M14 14h2M8 17h2"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></symbol>
    <symbol id="i-pct" viewBox="0 0 24 24"><path d="M18 6L6 18"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></symbol>
    <symbol id="i-washer" viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 7h16"/><circle cx="12" cy="14" r="4.5"/><path d="M7 4.8h2"/></symbol>
    <symbol id="i-fridge" viewBox="0 0 24 24"><rect x="5.5" y="2.5" width="13" height="19" rx="2"/><path d="M5.5 10h13M8.5 5.5v2M8.5 12.5v3"/></symbol>
    <symbol id="i-stove" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 11h16"/><circle cx="8.5" cy="7" r="1.6"/><circle cx="15.5" cy="7" r="1.6"/><rect x="7.5" y="14" width="9" height="4.5" rx=".8"/></symbol>
    <symbol id="i-tv" viewBox="0 0 24 24"><rect x="2.5" y="4.5" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 17.5V21"/></symbol>
    <symbol id="i-kettle" viewBox="0 0 24 24"><path d="M6 20h12l-1.5-11h-9zM8 9l1-4h6l1 4M16.5 11h1.5a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-1"/></symbol>
    <symbol id="i-vacuum" viewBox="0 0 24 24"><path d="M14 3l-5 14"/><path d="M4 21h9a3 3 0 0 0 0-6H8.5"/><circle cx="17" cy="18" r="3"/></symbol>
    <symbol id="i-bear" viewBox="0 0 24 24"><circle cx="6.5" cy="6" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="12" cy="13" r="7"/><path d="M10.5 15.5c.9.7 2.1.7 3 0M9.5 11.5h.01M14.5 11.5h.01"/></symbol>
    <symbol id="i-blocks" viewBox="0 0 24 24"><rect x="3" y="13" width="18" height="7" rx="1"/><rect x="6" y="6" width="10" height="7" rx="1"/><path d="M8 13v-2M12 13v-2M7.5 6V4.5M11 6V4.5M14.5 6V4.5"/></symbol>
    <symbol id="i-car" viewBox="0 0 24 24"><path d="M3 15v-3l2.5-5h11l2.5 5h2v3h-2"/><path d="M5 15h11"/><circle cx="7" cy="16.5" r="2"/><circle cx="16" cy="16.5" r="2"/><path d="M12 3v4M10 3h4"/></symbol>
    <symbol id="i-doll" viewBox="0 0 24 24"><circle cx="12" cy="6" r="3.2"/><path d="M12 9.2L6.5 21h11z"/><path d="M8 13l-3 2M16 13l3 2"/></symbol>
    <symbol id="i-bike" viewBox="0 0 24 24"><circle cx="5.5" cy="16" r="3.5"/><circle cx="18.5" cy="16" r="3.5"/><path d="M5.5 16l4-7h6l3 7M9.5 9L12 16h-6.5M14 6h3l-1.5 3"/></symbol>
    <symbol id="i-pram" viewBox="0 0 24 24"><path d="M4 11h15a7 7 0 0 1-7 6h-1a7 7 0 0 1-7-6zM11 11V4a7 7 0 0 1 7 7M19 11l2-4"/><circle cx="7.5" cy="20" r="1.5"/><circle cx="15.5" cy="20" r="1.5"/></symbol>
    <symbol id="i-roll" viewBox="0 0 24 24"><rect x="3" y="4" width="12" height="16" rx="1.5"/><path d="M15 6h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4M6 8h6M6 12h6"/></symbol>
    <symbol id="i-home" viewBox="0 0 24 24"><path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5"/></symbol>
    <symbol id="i-house" viewBox="0 0 48 44"><path d="M3 21L24 4l21 17"/><path d="M9 17v23h30V17"/><path d="M20 40V29h8v11" style="stroke:var(--accent)"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></symbol>
    <symbol id="i-chat" viewBox="0 0 24 24"><path d="M4.5 5h15v10.5H10l-4.5 3.5v-3.5h-1z"/></symbol>
    <symbol id="i-scales" viewBox="0 0 24 24"><path d="M12 4v15M7.5 19.5h9M5 7.5h14M5 7.5L2.5 13a2.5 2.5 0 0 0 5 0zM19 7.5L16.5 13a2.5 2.5 0 0 0 5 0z"/></symbol>
    <symbol id="i-gift" viewBox="0 0 24 24"><path d="M4.5 11h15v9h-15zM3.5 7.5h17V11h-17zM12 7.5V20M12 7.5C11 4.5 7.5 4 7.5 6s3 1.5 4.5 1.5zM12 7.5c1-3 4.5-3.5 4.5-1.5s-3 1.5-4.5 1.5z"/></symbol>
    <symbol id="i-info" viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M12 7.5v4.5M12 14.5h.01"/></symbol>
    <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3.5 12.5l8-8h8v8l-8 8z"/><circle cx="15.5" cy="8.5" r="1.4"/></symbol>
    <symbol id="i-rug" viewBox="0 0 24 24"><rect x="4.5" y="5" width="15" height="14" rx="1"/><rect x="8" y="8.5" width="8" height="7" rx=".5"/><path d="M7 5V3M10 5V3M13 5V3M16 5V3M7 21v-2M10 21v-2M13 21v-2M16 21v-2"/></symbol>
    <symbol id="i-card" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
    <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
    <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/></symbol>
    <symbol id="i-logout" viewBox="0 0 24 24"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/></symbol>
    <symbol id="i-box" viewBox="0 0 24 24"><path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/></symbol>
    <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></symbol>
    <symbol id="i-bank" viewBox="0 0 24 24"><path d="M3 9.5L12 4l9 5.5M4.5 9.5h15M6 10v7M10 10v7M14 10v7M18 10v7M3.5 20h17"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></symbol>
    <symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></symbol>
    <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/></symbol>
    <symbol id="i-courier" viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"/><path d="M5.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></symbol>
    <symbol id="i-google" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6L6.4 14z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"/></symbol>
  </defs>
</svg>`);
