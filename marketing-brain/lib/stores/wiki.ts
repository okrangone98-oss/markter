// 위키 클라이언트 상태 관리 (Zustand)
import { create } from "zustand";

import {
  normalizeCategory,
  type WikiCategory,
  type WikiPage,
  type WikiPageCreateInput,
  type WikiPageUpdateInput,
} from "@/lib/wiki/types";

interface WikiStore {
  pages: WikiPage[];
  currentPageId: string | null;
  search: string;
  loading: boolean;
  error: string | null;

  fetchPages: () => Promise<void>;
  selectPage: (id: string | null) => void;
  createPage: (input?: Partial<WikiPageCreateInput>) => Promise<WikiPage | null>;
  bulkCreatePages: (inputs: WikiPageCreateInput[]) => Promise<{ created: number; failed: number }>;
  updatePage: (id: string, patch: WikiPageUpdateInput) => Promise<WikiPage | null>;
  deletePage: (id: string) => Promise<boolean>;
  setSearch: (q: string) => void;
  backToDashboard: () => void;
  filterByCategory: (cat: WikiCategory) => void;
  filterByTag: (tag: string) => void;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`);
  return json as T;
}

export const useWikiStore = create<WikiStore>((set, get) => ({
  pages: [],
  currentPageId: null,
  search: "",
  loading: false,
  error: null,

  async fetchPages() {
    set({ loading: true, error: null });
    try {
      const { pages } = await api<{ pages: WikiPage[] }>("/api/wiki");
      set({ pages, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  selectPage(id) {
    set({ currentPageId: id });
  },

  async createPage(input = {}) {
    set({ loading: true, error: null });
    try {
      const body: WikiPageCreateInput = {
        title: input.title ?? "새 페이지",
        content:
          input.content ??
          "# 새 페이지\n\n## 핵심 요약\n- \n\n## 상세\n\n\n## 관련\n[[]]\n",
        category: normalizeCategory(input.category),
        tags: input.tags ?? [],
        source: input.source ?? null,
      };
      const { page } = await api<{ page: WikiPage }>("/api/wiki", {
        method: "POST",
        body: JSON.stringify(body),
      });
      set((s) => ({
        pages: [page, ...s.pages],
        currentPageId: page.id,
        loading: false,
      }));
      return page;
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      return null;
    }
  },

  async bulkCreatePages(inputs) {
    let created = 0;
    let failed = 0;
    const newPages: WikiPage[] = [];
    for (const input of inputs) {
      try {
        const { page } = await api<{ page: WikiPage }>("/api/wiki", {
          method: "POST",
          body: JSON.stringify({
            title: input.title,
            content: input.content,
            category: normalizeCategory(input.category),
            tags: input.tags ?? [],
            source: input.source ?? null,
          }),
        });
        newPages.push(page);
        created++;
      } catch {
        failed++;
      }
    }
    if (newPages.length > 0) {
      set((s) => ({ pages: [...newPages, ...s.pages] }));
    }
    return { created, failed };
  },

  async updatePage(id, patch) {
    try {
      const { page } = await api<{ page: WikiPage }>(`/api/wiki/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      set((s) => ({
        pages: s.pages.map((p) => (p.id === id ? page : p)),
      }));
      return page;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  async deletePage(id) {
    try {
      await api(`/api/wiki/${id}`, { method: "DELETE" });
      set((s) => ({
        pages: s.pages.filter((p) => p.id !== id),
        currentPageId: s.currentPageId === id ? null : s.currentPageId,
      }));
      return true;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  setSearch(q) { set({ search: q }); },

  backToDashboard() { set({ currentPageId: null }); },

  filterByCategory(cat) {
    const { pages } = get();
    const matched = pages.filter((p) => p.category === cat);
    if (matched.length === 0) {
      // 빈 카테고리는 새 페이지 생성 단축키로 활용
      get().createPage({ category: cat, title: `새 ${cat} 페이지` });
    } else {
      set({ search: "", currentPageId: matched[0].id });
    }
  },

  filterByTag(tag) {
    set({ search: tag, currentPageId: null });
  },
}));
