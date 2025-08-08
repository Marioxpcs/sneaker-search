"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Upload, Menu } from "lucide-react";
import SneakerGrid from "./components/SneakerGrid";
import { Sneaker } from "./types/sneaker";

// ✅ Reusable status banner component
function StatusBanner({ type, title, message }: { type: "error" | "warning" | "success" | "info"; title: string; message: string }) {
  const colors = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`border p-4 rounded-lg mb-6 ${colors[type]}`}>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ✅ Filters bar component
function FiltersBar({ search, setSearch, brand, setBrand, brands, sort, setSort, toggleUpload }: {
  search: string;
  setSearch: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  brands: string[];
  sort: string;
  setSort: (value: string) => void;
  toggleUpload: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
      <input
        type="text"
        placeholder="Search sneakers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <select value={brand} onChange={(e) => setBrand(e.target.value)} className="px-4 py-2 border rounded-lg">
        <option value="">All Brands</option>
        {brands.map((b: string) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2 border rounded-lg">
        <option value="name">Sort: Name</option>
        <option value="price">Sort: Price</option>
      </select>
      <button onClick={toggleUpload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Upload size={18} /> Upload
      </button>
    </div>
  );
}

// ✅ Upload panel (collapsible instead of modal)
function UploadPanel({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (image: File, description: string) => void;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!image) return;
    onSubmit(image, description);
    setImage(null);
    setDescription("");
    setPreviewUrl(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border shadow-md mt-4">
      <h2 className="text-lg font-semibold mb-2">Upload Sneaker Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
      {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-40 rounded mb-2" />}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded-lg p-2 mb-2"
      />
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Submit
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ✅ Main Home page
export default function Home() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("name");
  const [error, setError] = useState<string | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  const fetchSneakers = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/search?search=${search}&brand=${brand}&sortBy=${sort}`);
      if (!res.ok) throw new Error("Failed to fetch sneakers");
      const data = await res.json();
      
      // Transform data to match Sneaker interface
      const transformedSneakers = data.data?.map((sneaker: any) => ({
        id: sneaker.id,
        name: sneaker.name,
        brand: sneaker.brand,
        colorway: sneaker.colorway || "Default Colorway",
        price: sneaker.price,
        image: sneaker.image,
        rating: typeof sneaker.rating === 'string' ? parseFloat(sneaker.rating) : sneaker.rating || 0,
        reviews: sneaker.reviews || 0,
        store: sneaker.store || "Unknown Store",
        description: sneaker.description,
        isRealData: sneaker.isRealData || false
      })) || [];
      
      setSneakers(transformedSneakers);
      setBrands(data.brands || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [search, brand, sort]);

  useEffect(() => {
    fetchSneakers();
  }, [fetchSneakers]);

  const handleUpload = async (image: File, description: string) => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      await fetchSneakers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-2xl font-bold">SneakerVault</Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
          <button className="md:hidden"><Menu size={24} /></button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Your Next Pair</h1>
          <p className="text-lg mb-6">Search, filter, and upload sneakers with ease.</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto p-4">
        {error && <StatusBanner type="error" title="Error" message={error} />}

        <FiltersBar
          search={search}
          setSearch={setSearch}
          brand={brand}
          setBrand={setBrand}
          brands={brands}
          sort={sort}
          setSort={setSort}
          toggleUpload={() => setUploadVisible((v) => !v)}
        />

        <UploadPanel
          visible={uploadVisible}
          onClose={() => setUploadVisible(false)}
          onSubmit={handleUpload}
        />

        <SneakerGrid sneakers={sneakers} />
      </main>
    </div>
  );
}
