import { useMemo, useState } from "react";
import { CategoryConfiguration } from "/src/components/category";
import {
  NestedTagsForItemPanel,
  NestedTagsForSearch,
} from "/src/components/nestedTags";

// CategoryFlatItem: {
//   id: number,
//   name: string,
//   displaySequence: number,
//   sourceId: number | null
// }
//
// `sourceId` is the parent category id. Root categories have `sourceId: null`.
const SEED_CATEGORIES = [
  { id: 1, name: "Food", displaySequence: 1, sourceId: null },
  { id: 2, name: "Drinks", displaySequence: 2, sourceId: null },
  { id: 3, name: "Snacks", displaySequence: 3, sourceId: null },
  { id: 4, name: "Hot Food", displaySequence: 1, sourceId: 1 },
  { id: 5, name: "Cold Food", displaySequence: 2, sourceId: 1 },
  { id: 6, name: "Soda", displaySequence: 1, sourceId: 2 },
  { id: 7, name: "Juice", displaySequence: 2, sourceId: 2 },
  { id: 8, name: "Grilled", displaySequence: 1, sourceId: 4 },
];

const SEED_PRODUCTS = [
  { id: "p1", name: "Grilled Chicken", categoryIds: [1, 4, 8] },
  { id: "p2", name: "Iced Soda", categoryIds: [2, 6] },
  { id: "p3", name: "Fresh Juice", categoryIds: [2, 7] },
  { id: "p4", name: "Potato Chips", categoryIds: [3] },
  { id: "p5", name: "Cold Sandwich", categoryIds: [1, 5] },
];

const pruneProductCategoryIds = (products, categories) => {
  const validIds = new Set(categories.map((c) => c.id));
  return products.map((product) => ({
    ...product,
    categoryIds: product.categoryIds.filter((id) => validIds.has(id)),
  }));
};

export default function Categories() {
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftCategoryIds, setDraftCategoryIds] = useState([]);
  const [deleteIds, setDeleteIds] = useState([]);
  const [activeTag, setActiveTag] = useState({ id: 0, name: "all" });
  const [currentPage, setCurrentPage] = useState(1);
  const [log, setLog] = useState([]);

  const appliedCategoryFlatItems = useMemo(
    () => categories.filter((item) => draftCategoryIds.includes(item.id)),
    [categories, draftCategoryIds],
  );

  const filteredProducts = useMemo(
    () =>
      activeTag.id === 0
        ? products
        : products.filter((product) =>
            product.categoryIds.includes(activeTag.id),
          ),
    [activeTag, products],
  );

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const addLog = (message) => {
    setLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev,
    ]);
  };

  const handleLocalSaveCategories = (flatItems) => {
    setCategories(flatItems);
    setProducts((prev) => pruneProductCategoryIds(prev, flatItems));
    setActiveTag({ id: 0, name: "all" });
    addLog(`Saved categories (${flatItems.length} items)`);
  };

  const handleCloseConfig = () => {
    addLog("Category config modal closed");
    setIsConfigOpen(false);
  };

  const openProductEditor = (product) => {
    setEditingProduct(product);
    setDraftName(product.name);
    setDraftCategoryIds([...product.categoryIds]);
    setDeleteIds([]);
  };

  const closeProductEditor = () => {
    setEditingProduct(null);
    setDraftName("");
    setDraftCategoryIds([]);
    setDeleteIds([]);
  };

  const saveProduct = () => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: draftName.trim() || product.name,
              categoryIds: draftCategoryIds,
            }
          : product,
      ),
    );
    addLog(
      `Updated product ${editingProduct.id} : categories [${draftCategoryIds.join(", ")}]`,
    );
    closeProductEditor();
  };

  const resetToSeed = () => {
    setCategories(SEED_CATEGORIES);
    setProducts(SEED_PRODUCTS);
    setActiveTag({ id: 0, name: "all" });
    addLog("Reset to seed data");
  };

  const clearCategories = () => {
    setCategories([]);
    setProducts((prev) =>
      prev.map((product) => ({ ...product, categoryIds: [] })),
    );
    setActiveTag({ id: 0, name: "all" });
    addLog("Cleared categories (empty init)");
  };

  return (
    <div className="bg-mist-950 text-slate-400 p-2 w-full h-full">
      <div className="flex justify-center w-full h-full overflow-auto">
        <div className="max-w-2xl w-full">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="rounded px-3 py-2 border border-slate-700 text-gray-200 bg-slate-800 hover:bg-slate-700"
              onClick={() => setIsConfigOpen(true)}
            >
              Open Config Modal
            </button>
            <button
              className="rounded px-3 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600"
              onClick={resetToSeed}
            >
              Reset seed
            </button>
            <button
              className="rounded px-3 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600"
              onClick={clearCategories}
            >
              Start empty
            </button>
          </div>

          <section className="bg-mist-950 border border-gray-700 rounded p-3 mb-4">
            <h5 className="font-semibold mb-1">Categories</h5>
            <pre
              className="border border-gray-700 rounded p-2 mb-0 min-h-80 max-h-max resize-y overflow-auto"
            >
              {JSON.stringify(categories, null, 2)}
            </pre>
          </section>

          <section className="bg-mist-950 border border-gray-700 rounded p-3 mb-4">
            <h5 className="font-semibold mb-1">Filter products</h5>
            <NestedTagsForSearch
              isFetchingCategories={false}
              wholeCategoryFlatItems={categories}
              appliedCategoryFlatItems={[]}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
              setCurrentPage={setCurrentPage}
              customClassNames={{
                default: `p-2 min-w-18 flex justify-center border border-indigo-600 rounded
                text-gray-300 hover:bg-mist-900`,
                active: `p-2 min-w-18 flex justify-center border border-indigo-600 rounded
                text-gray-300 bg-indigo-600 hover:bg-indigo-500`,
                subTagContainer: `min-w-20 border border-indigo-600 rounded text-gray-300 bg-mist-950`,
              }}
              fullWidth={false}
            />

            <div className="mt-3">
              <div className="font-semibold mb-2">
                Products ({filteredProducts.length}) — page {currentPage}
              </div>
              <ul className="space-y-0">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-2 border border-gray-700 bg-mist-950 px-3 py-2 text-slate-400"
                  >
                    <div>
                      <div>{product.name}</div>
                      <div>
                        {product.categoryIds.length ? (
                          <>
                            <div>{JSON.stringify(product)}</div>
                            <div>
                              {product.categoryIds
                                .map(
                                  (id) =>
                                    `${categoryNameById[id]} (${id})` || id,
                                )
                                .join(" - ")}
                            </div>
                          </>
                        ) : (
                          "no categories"
                        )}
                      </div>
                    </div>
                    <button
                      className="rounded p-2 text-gray-300 bg-gray-800 hover:bg-gray-700"
                      onClick={() => openProductEditor(product)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
                {!filteredProducts.length && (
                  <li className="border border-gray-700 bg-mist-950 px-3 py-2 text-slate-400">
                    No products match this category.
                  </li>
                )}
              </ul>
            </div>
          </section>

          {log.length > 0 && (
            <section className="bg-mist-950 border border-gray-700 rounded p-3 mb-4">
              <h5 className="font-semibold mb-1">Logs</h5>
              <ul className="mb-0 list-none pl-0">
                {log.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ul>
            </section>
          )}

          {isConfigOpen && (
            <CategoryConfiguration
              categoryFlatItems={categories}
              onClose={handleCloseConfig}
              setIsUpdated={() => {}}
              disableSave
              onLocalSave={handleLocalSaveCategories}
            />
          )}

          {editingProduct && (
            <>
              <div
                className="fixed top-0 left-0 bg-black opacity-75 w-full h-full"
                style={{ zIndex: 100 }}
              />
              <div
                className="fixed top-0 left-0 flex justify-center items-center w-full h-full p-3"
                style={{ zIndex: 101 }}
              >
                <div
                  className="bg-mist-950 border rounded p-3 text-slate-400"
                  style={{
                    width: "100%",
                    maxWidth: 560,
                    maxHeight: "90vh",
                    overflow: "auto",
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-light mb-0">Edit product</h5>
                    <button
                      className="h-5 w-5 cursor-pointer text-white before:content-['×'] before:text-2xl before:leading-none"
                      onClick={closeProductEditor}
                    />
                  </div>

                  <label className="mb-2 block">Name</label>
                  <input
                    className="mb-3 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />

                  <div className="font-semibold mb-2">Apply categories</div>
                  <NestedTagsForItemPanel
                    isFetchingCategories={false}
                    wholeCategoryFlatItems={categories}
                    appliedCategoryFlatItems={appliedCategoryFlatItems}
                    setNewAppliedCategoryIds={(ids) => {
                      setDraftCategoryIds(ids);
                      addLog(`draft categoryIds -- [${ids.join(", ")}]`);
                    }}
                    setCategoryIdsToDelete={(ids) => {
                      setDeleteIds(ids);
                      addLog(`categoryIdsToDelete -- [${ids.join(", ")}]`);
                    }}
                    isReadOnly={false}
                    activeTag={activeTag}
                  />

                  <pre className="border rounded p-2 mt-3 mb-3">
                    {JSON.stringify({ draftCategoryIds, deleteIds }, null, 2)}
                  </pre>

                  <div className="flex justify-end gap-2">
                    <button
                      className="inline-flex items-center rounded border border-gray-400 px-3 py-2 text-gray-300 hover:bg-gray-800"
                      onClick={closeProductEditor}
                    >
                      Cancel
                    </button>
                    <button
                      className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      onClick={saveProduct}
                    >
                      Save product
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
