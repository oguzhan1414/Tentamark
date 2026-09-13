export type DemoSocialMessage = {
  id: string;
  platform: "instagram" | "facebook";
  kind: "comment" | "dm";
  external_thread_id: string;
  author_name: string;
  body: string;
  status: "open" | "done";
  created_at: string;
};

// Purely local sample data — shown only while "Örnek verileri göster" is on,
// never written anywhere. Same isDemo/showDemo split used in Approvals and
// Calendar: gives a new user a feel for the finished feature before any real
// webhook event has ever landed, without pretending it's real activity.
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const DEMO_INBOX_MESSAGES: DemoSocialMessage[] = [
  {
    id: "demo-1",
    platform: "instagram",
    kind: "comment",
    external_thread_id: "demo-post-1",
    author_name: "ayse.k",
    body: "Bu ürünü nereden temin edebilirim, kargo İzmir'e geliyor mu?",
    status: "open",
    created_at: hoursAgo(2),
  },
  {
    id: "demo-2",
    platform: "instagram",
    kind: "dm",
    external_thread_id: "demo-user-2",
    author_name: "mert_yilmaz",
    body: "Merhaba, toptan alım için nasıl iletişime geçebiliriz?",
    status: "open",
    created_at: hoursAgo(5),
  },
  {
    id: "demo-3",
    platform: "facebook",
    kind: "comment",
    external_thread_id: "demo-post-3",
    author_name: "Elif Demir",
    body: "Harika bir paylaşım, elinize sağlık!",
    status: "done",
    created_at: hoursAgo(20),
  },
  {
    id: "demo-4",
    platform: "facebook",
    kind: "dm",
    external_thread_id: "demo-user-4",
    author_name: "Can Öztürk",
    body: "Geçen hafta sipariş verdim ama hâlâ kargoya verilmedi, yardımcı olur musunuz?",
    status: "open",
    created_at: hoursAgo(30),
  },
  {
    id: "demo-5",
    platform: "instagram",
    kind: "comment",
    external_thread_id: "demo-post-5",
    author_name: "zeynep.b",
    body: "Renk seçenekleri neler, bir de bordo var mı?",
    status: "done",
    created_at: hoursAgo(48),
  },
];
