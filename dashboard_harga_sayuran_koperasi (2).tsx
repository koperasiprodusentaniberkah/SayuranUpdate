import React, { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Edit3, 
  Eye, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  Share2, 
  Store, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  PlusCircle,
  Calculator,
  MessageSquare,
  Copy,
  Printer,
  Download,
  LineChart,
  X,
  ShoppingBag,
  Send,
  Clock,
  Wifi,
  WifiOff,
  Bot,
  CloudSun,
  Award,
  Percent,
  Flame
} from 'lucide-react';

// Interface Data
export interface Vegetable {
  id: number;
  name: string;
  category: string;
  unit: string;
  todayPrice: number;
  yesterdayPrice: number;
  stock: string;
  history: number[];
}

export interface EditPricesState {
  todayPrice: number;
  yesterdayPrice: number;
  stock: string;
}

export interface NewVegState {
  name: string;
  category: string;
  unit: string;
  todayPrice: number;
  yesterdayPrice: number;
  stock: string;
}

declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

// Data Awal 20 Sayuran dengan Riwayat Harga 7 Hari
const initialVegetables: Vegetable[] = [
  { id: 1, name: 'Bawang Daun', category: 'Bumbu & Daun', unit: 'kg', todayPrice: 12000, yesterdayPrice: 11000, stock: 'Dibutuhkan Banyak', history: [10000, 10500, 11000, 11000, 10800, 11000, 12000] },
  { id: 2, name: 'Buncis', category: 'Polong', unit: 'kg', todayPrice: 9000, yesterdayPrice: 9500, stock: 'Sedang', history: [10000, 9800, 9500, 9500, 9700, 9500, 9000] },
  { id: 3, name: 'Cabai Hijau TW', category: 'Cabai', unit: 'kg', todayPrice: 22000, yesterdayPrice: 20000, stock: 'Sedang', history: [18000, 19000, 19500, 20000, 20000, 20000, 22000] },
  { id: 4, name: 'Cabai Keriting Hijau', category: 'Cabai', unit: 'kg', todayPrice: 24000, yesterdayPrice: 24000, stock: 'Cukup', history: [23000, 23500, 24000, 24000, 24000, 24000, 24000] },
  { id: 5, name: 'Cabai Keriting Merah', category: 'Cabai', unit: 'kg', todayPrice: 38000, yesterdayPrice: 35000, stock: 'Dibutuhkan Banyak', history: [32000, 33000, 34000, 35000, 35000, 35000, 38000] },
  { id: 6, name: 'Cabai Merah', category: 'Cabai', unit: 'kg', todayPrice: 40000, yesterdayPrice: 42000, stock: 'Sedang', history: [45000, 44000, 43000, 42000, 42000, 42000, 40000] },
  { id: 7, name: 'Cabai Rawit Hijau (Japlak)', category: 'Cabai', unit: 'kg', todayPrice: 32000, yesterdayPrice: 30000, stock: 'Sedang', history: [28000, 29000, 30000, 30000, 31000, 30000, 32000] },
  { id: 8, name: 'Cabai Rawit Merah (Domba)', category: 'Cabai', unit: 'kg', todayPrice: 55000, yesterdayPrice: 50000, stock: 'Dibutuhkan Banyak', history: [45000, 48000, 50000, 50000, 52000, 50000, 55000] },
  { id: 9, name: 'Kacang Panjang', category: 'Polong', unit: 'kg', todayPrice: 8000, yesterdayPrice: 8000, stock: 'Cukup', history: [8000, 8500, 8000, 8000, 8000, 8000, 8000] },
  { id: 10, name: 'Lopang', category: 'Buah', unit: 'kg', todayPrice: 6000, yesterdayPrice: 6500, stock: 'Cukup', history: [7000, 6800, 6500, 6500, 6500, 6500, 6000] },
  { id: 11, name: 'Pakcoy', category: 'Daun', unit: 'kg', todayPrice: 7000, yesterdayPrice: 7000, stock: 'Cukup', history: [6500, 7000, 7000, 7000, 7000, 7000, 7000] },
  { id: 12, name: 'Pare (Paria)', category: 'Buah', unit: 'kg', todayPrice: 9000, yesterdayPrice: 8500, stock: 'Sedang', history: [8000, 8200, 8500, 8500, 8500, 8500, 9000] },
  { id: 13, name: 'Sawi Hijau (Caosin)', category: 'Daun', unit: 'kg', todayPrice: 6500, yesterdayPrice: 6000, stock: 'Cukup', history: [5500, 6000, 6000, 6000, 6200, 6000, 6500] },
  { id: 14, name: 'Terong Lalap', category: 'Buah', unit: 'kg', todayPrice: 7500, yesterdayPrice: 8000, stock: 'Cukup', history: [8500, 8200, 8000, 8000, 8000, 8000, 7500] },
  { id: 15, name: 'Terong Ungu', category: 'Buah', unit: 'kg', todayPrice: 8500, yesterdayPrice: 8500, stock: 'Sedang', history: [8500, 8500, 8500, 8500, 8500, 8500, 8500] },
  { id: 16, name: 'Tomat', category: 'Buah', unit: 'kg', todayPrice: 14000, yesterdayPrice: 12000, stock: 'Dibutuhkan Banyak', history: [10000, 11000, 12000, 12000, 13000, 12000, 14000] },
  { id: 17, name: 'Kembang Kol', category: 'Bunga', unit: 'kg', todayPrice: 18000, yesterdayPrice: 19000, stock: 'Sedang', history: [20000, 19500, 19000, 19000, 19000, 19000, 18000] },
  { id: 18, name: 'Salada', category: 'Daun', unit: 'kg', todayPrice: 11000, yesterdayPrice: 10000, stock: 'Sedang', history: [9500, 10000, 10000, 10000, 10500, 10000, 11000] },
  { id: 19, name: 'Ranti (Leunca)', category: 'Buah', unit: 'kg', todayPrice: 9500, yesterdayPrice: 9500, stock: 'Cukup', history: [9000, 9500, 9500, 9500, 9500, 9500, 9500] },
  { id: 20, name: 'Jagung Manis', category: 'Biji', unit: 'kg', todayPrice: 7000, yesterdayPrice: 6500, stock: 'Cukup', history: [6000, 6200, 6500, 6500, 6800, 6500, 7000] },
];

// Inisialisasi Firebase Cloud Service
let db: Firestore | null = null;
let auth: Auth | null = null;
let appId = 'koperasi-sayur-app';

try {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    const firebaseConfig = JSON.parse(window.__firebase_config);
    const app: FirebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  if (typeof window !== 'undefined' && window.__app_id) {
    appId = window.__app_id;
  }
} catch (e) {
  console.log("Menjalankan dalam mode penyimpanan lokal.");
}

export default function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // State Utama Data Sayur
  const [vegetables, setVegetables] = useState<Vegetable[]>(() => {
    const saved = localStorage.getItem('koperasi_harga_sayur_v5');
    return saved ? JSON.parse(saved) : initialVegetables;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrices, setEditPrices] = useState<EditPricesState>({ todayPrice: 0, yesterdayPrice: 0, stock: 'Sedang' });
  const [toastMessage, setToastMessage] = useState<string>('');
  
  const [marketNote, setMarketNote] = useState<string>(() => {
    return localStorage.getItem('koperasi_market_note') || 'Penerimaan hasil panen di gudang dibuka jam 08.00 - 15.00 WIB. Utamakan kualitas grade A.';
  });
  
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem('koperasi_last_updated') || new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Modal State
  const [selectedChartVeg, setSelectedChartVeg] = useState<Vegetable | null>(null);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcVegId, setCalcVegId] = useState<number>(1);
  const [calcWeight, setCalcWeight] = useState<number | string>(100);

  // Modal Setor Panen
  const [sellModalVeg, setSellModalVeg] = useState<Vegetable | null>(null);
  const [farmerName, setFarmerName] = useState<string>('');
  const [sellWeight, setSellWeight] = useState<number | string>('');
  const [saprotanDeduction, setSaprotanDeduction] = useState<number | string>(0);
  const [includeSaprotan, setIncludeSaprotan] = useState<boolean>(false);

  // Modal Tambah Sayur
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newVeg, setNewVeg] = useState<NewVegState>({ name: '', category: 'Daun', unit: 'kg', todayPrice: 10000, yesterdayPrice: 10000, stock: 'Sedang' });

  // 1. Inisialisasi Autentikasi Cloud
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Gagal autentikasi cloud:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Listener Firestore Real-time
  useEffect(() => {
    if (!db || !user) return;

    const dataDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'main_dashboard', 'data_sayur');

    const unsubscribe = onSnapshot(
      dataDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.vegetables) setVegetables(cloudData.vegetables);
          if (cloudData.marketNote) setMarketNote(cloudData.marketNote);
          if (cloudData.lastUpdated) setLastUpdated(cloudData.lastUpdated);
          setIsCloudSynced(true);
        } else {
          saveDataToCloud(vegetables, marketNote, lastUpdated);
          setIsCloudSynced(true);
        }
      },
      (error) => {
        console.error("Error real-time cloud:", error);
        setIsCloudSynced(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Simpan ke LocalStorage sebagai cadangan
  useEffect(() => {
    localStorage.setItem('koperasi_harga_sayur_v5', JSON.stringify(vegetables));
  }, [vegetables]);

  const saveDataToCloud = async (updatedVegs: Vegetable[], note: string, updatedDate: string) => {
    if (!db || !user) return;
    try {
      const dataDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'main_dashboard', 'data_sayur');
      await setDoc(dataDocRef, {
        vegetables: updatedVegs,
        marketNote: note,
        lastUpdated: updatedDate,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsCloudSynced(true);
    } catch (err) {
      console.error("Gagal menyimpan ke cloud:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleEditClick = (veg: Vegetable) => {
    setEditingId(veg.id);
    setEditPrices({ todayPrice: veg.todayPrice, yesterdayPrice: veg.yesterdayPrice, stock: veg.stock || 'Sedang' });
  };

  const handleSaveEdit = (id: number) => {
    const newVegs = vegetables.map(item => {
      if (item.id === id) {
        const newToday = Number(editPrices.todayPrice);
        const updatedHistory = [...(item.history || [item.yesterdayPrice]), newToday].slice(-7);
        return {
          ...item,
          todayPrice: newToday,
          yesterdayPrice: Number(editPrices.yesterdayPrice),
          stock: editPrices.stock,
          history: updatedHistory
        };
      }
      return item;
    });

    setVegetables(newVegs);
    setEditingId(null);
    saveDataToCloud(newVegs, marketNote, lastUpdated);
    showToast('Harga penerimaan diperbarui secara terpusat!');
  };

  const handleSaveMarketNote = (note: string) => {
    setMarketNote(note);
    localStorage.setItem('koperasi_market_note', note);
    saveDataToCloud(vegetables, note, lastUpdated);
    showToast('Pengumuman gudang diperbarui secara terpusat!');
  };

  const handleAddVegetable = () => {
    if (!newVeg.name.trim()) return;
    const newItem: Vegetable = {
      id: Date.now(),
      name: newVeg.name,
      category: newVeg.category,
      unit: newVeg.unit,
      todayPrice: Number(newVeg.todayPrice),
      yesterdayPrice: Number(newVeg.yesterdayPrice),
      stock: newVeg.stock,
      history: [Number(newVeg.yesterdayPrice), Number(newVeg.todayPrice)]
    };
    const newVegs = [...vegetables, newItem];
    setVegetables(newVegs);
    setShowAddModal(false);
    setNewVeg({ name: '', category: 'Daun', unit: 'kg', todayPrice: 10000, yesterdayPrice: 10000, stock: 'Sedang' });
    saveDataToCloud(newVegs, marketNote, lastUpdated);
    showToast('Komoditas baru ditambahkan ke cloud!');
  };

  const updateAllPricesDate = () => {
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setLastUpdated(todayFormatted);
    localStorage.setItem('koperasi_last_updated', todayFormatted);
    saveDataToCloud(vegetables, marketNote, todayFormatted);
    showToast('Tanggal penetapan harga diperbarui!');
  };

  const categories = ['Semua', ...Array.from(new Set(vegetables.map(v => v.category)))];

  const filteredVegetables = vegetables.filter(veg => {
    const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || veg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const priceIncreased = vegetables.filter(v => v.todayPrice > v.yesterdayPrice).length;
  const priceDecreased = vegetables.filter(v => v.todayPrice < v.yesterdayPrice).length;
  const priceStable = vegetables.filter(v => v.todayPrice === v.yesterdayPrice).length;

  const topGainers = [...vegetables].sort((a, b) => {
    const diffA = a.todayPrice - a.yesterdayPrice;
    const diffB = b.todayPrice - b.yesterdayPrice;
    return diffB - diffA;
  }).slice(0, 3);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const calculateChange = (today: number, yesterday: number) => {
    const diff = today - yesterday;
    const percent = yesterday > 0 ? ((diff / yesterday) * 100).toFixed(1) : '0';
    return { diff, percent };
  };

  const handleSendSetorWA = () => {
    if (!sellModalVeg) return;
    if (!farmerName.trim() || !sellWeight || Number(sellWeight) <= 0) {
      alert('Mohon isi nama petani dan perkiraan berat hasil panen.');
      return;
    }
    const totalGross = Number(sellWeight) * sellModalVeg.todayPrice;
    const netTotal = includeSaprotan ? Math.max(0, totalGross - Number(saprotanDeduction)) : totalGross;

    let text = `*KONFIRMASI RENCANA SETOR PANEN*\n`;
    text += `------------------------------------\n`;
    text += `👤 *Nama Anggota:* ${farmerName}\n`;
    text += `🥬 *Komoditas:* ${sellModalVeg.name}\n`;
    text += `⚖️ *Perkiraan Berat:* ${sellWeight} ${sellModalVeg.unit}\n`;
    text += `💰 *Harga Koperasi:* ${formatRupiah(sellModalVeg.todayPrice)}/${sellModalVeg.unit}\n`;
    text += `💵 *Total Kotor:* ${formatRupiah(totalGross)}\n`;
    if (includeSaprotan && Number(saprotanDeduction) > 0) {
      text += `💳 *Potong Bon/Saprotan:* -${formatRupiah(Number(saprotanDeduction))}\n`;
      text += `✨ *ESTIMASI BERSIH DITERIMA:* ${formatRupiah(netTotal)}\n`;
    } else {
      text += `✨ *ESTIMASI BERSIH DITERIMA:* ${formatRupiah(totalGross)}\n`;
    }
    text += `📅 *Rencana Setor:* Hari ini (${lastUpdated})\n`;
    text += `------------------------------------\n`;
    text += `Mohon persiapkan penimbangan di gudang. Terima kasih!`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setSellModalVeg(null);
    setFarmerName('');
    setSellWeight('');
    setSaprotanDeduction(0);
    setIncludeSaprotan(false);
  };

  const generateWAText = () => {
    let text = `*DAFTAR HARGA BELI SAYURAN KOPERASI HARI INI*\n`;
    text += `🌱 *Koperasi Produsen Mitra Tani Berkah*\n`;
    text += `📅 ${lastUpdated}\n\n`;
    text += `📢 *Info Gudang:* _${marketNote}_\n\n`;
    text += `🔥 *KOMODITAS NAIK TERTINGGI:* ${topGainers[0]?.name || '-'} (${formatRupiah(topGainers[0]?.todayPrice || 0)})\n\n`;
    text += `------------------------------------\n`;
    vegetables.forEach((v, idx) => {
      const { diff } = calculateChange(v.todayPrice, v.yesterdayPrice);
      const icon = diff > 0 ? '📈 (Naik)' : diff < 0 ? '📉 (Turun)' : '➡️ (Stabil)';
      text += `${idx + 1}. *${v.name}*: ${formatRupiah(v.todayPrice)}/${v.unit} ${icon}\n`;
    });
    text += `------------------------------------\n`;
    text += `*Cek grafik, saran AI & konfirmasi setor panen:* https://koperasi-tani.id/harga-hari-ini`;
    return text;
  };

  const handleCopyWAText = () => {
    navigator.clipboard.writeText(generateWAText());
    showToast('Teks harga disalin! Siap ditempel di grup WA.');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(generateWAText())}`, '_blank');
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,No,Nama Sayuran,Kategori,Harga Kemarin,Harga Hari Ini,Selisih,Kebutuhan Gudang\n";
    vegetables.forEach((v, i) => {
      const diff = v.todayPrice - v.yesterdayPrice;
      csvContent += `${i + 1},"${v.name}","${v.category}",${v.yesterdayPrice},${v.todayPrice},${diff},"${v.stock || '-'}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `harga_beli_koperasi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCalcVeg = vegetables.find(v => v.id === Number(calcVegId)) || vegetables[0];
  const totalCalcIncome = selectedCalcVeg ? selectedCalcVeg.todayPrice * Number(calcWeight) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">
                    Koperasi Produsen <span className="text-emerald-600">Mitra Tani Berkah</span>
                  </h1>
                  {isCloudSynced ? (
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Wifi className="w-3 h-3" /> Real-time Cloud
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <WifiOff className="w-3 h-3" /> Mode Lokal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Tanggal Acuan: {lastUpdated}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('public')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'public'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Tampilan Anggota Petani</span>
                <span className="sm:hidden">Petani</span>
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Panel Input Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'admin' && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden print:hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Panel Pengurus Koperasi
                </span>
                <h2 className="text-2xl font-bold">Set Harga Beli Koperasi Hari Ini</h2>
                <p className="text-slate-300 text-sm mt-1 max-w-xl">
                  Setiap perubahan harga yang Anda simpan akan langsung memperbarui tampilan di seluruh HP petani anggota secara real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <PlusCircle className="w-4 h-4" /> Tambah Jenis Sayur
                </button>
                <button
                  onClick={updateAllPricesDate}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Set Tanggal Hari Ini
                </button>
                <button
                  onClick={handleCopyWAText}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> Salin Teks WA
                </button>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-1 sm:mt-0" />
              <input
                type="text"
                value={marketNote}
                onChange={(e) => setMarketNote(e.target.value)}
                placeholder="Tulis informasi penimbangan/jam buka gudang..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => handleSaveMarketNote(marketNote)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0"
              >
                Simpan Info
              </button>
            </div>
          </div>
        )}

        {activeTab === 'public' && (
          <div className="mb-8 space-y-4 print:mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  Daftar Resmi Penerimaan Hasil Panen • Real-time
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Harga Beli Koperasi Hari Ini
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Acuan patokan harga bagi seluruh anggota petani yang ingin menyetor/menjual hasil panen sayuran ke Koperasi Mitra Tani Berkah.
                </p>
              </div>
              
              <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto relative z-10 print:hidden">
                <button
                  onClick={() => setShowCalculator(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-emerald-600" /> Hitung Hasil Panen
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share Daftar ke WA
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Cetak
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <div className="md:col-span-2 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-indigo-800 flex items-start gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 text-indigo-300 shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">Rekomendasi AI Panen Hari Ini</h4>
                    <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] rounded-full font-bold">Smart AI</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    {priceIncreased > priceDecreased 
                      ? `Pasar sedang bergairah! Terdapat ${priceIncreased} komoditas yang mengalami kenaikan harga. Komoditas seperti ${topGainers[0]?.name || 'Cabai'} sangat direkomendasikan untuk dipanen hari ini.`
                      : `Harga relatif stabil. Disarankan menjaga kesegaran tanaman dan memanen sesuai standar kualitas grade A koperasi.`
                    }
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cuaca Wilayah Tani</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">Cerah Berawan</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">27°C</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Ideal untuk penimbangan di gudang</p>
                </div>
                <CloudSun className="w-10 h-10 text-amber-500 shrink-0" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm print:hidden">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Komoditas Paling Dicari / Naik Paling Tinggi Hari Ini
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topGainers.map((item, index) => {
                  const { percent } = calculateChange(item.todayPrice, item.yesterdayPrice);
                  return (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          index === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{item.name}</h5>
                          <span className="text-xs font-black text-emerald-600">{formatRupiah(item.todayPrice)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-500" /> +{percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {marketNote && (
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Informasi Gudang & Penimbangan Hari Ini:</h4>
                  <p className="text-sm font-medium text-amber-900 mt-0.5">{marketNote}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 print:grid-cols-3">
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-center shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Harga Naik Hari Ini</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center justify-center gap-1">
                  <ArrowUpRight className="w-5 h-5" /> {priceIncreased} Jenis
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Harga Turun Hari Ini</span>
                <span className="text-xl sm:text-2xl font-black text-rose-600 flex items-center justify-center gap-1">
                  <ArrowDownRight className="w-5 h-5" /> {priceDecreased} Jenis
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                <span className="text-xs text-slate-500 font-medium block">Harga Stabil</span>
                <span className="text-xl sm:text-2xl font-black text-slate-700 flex items-center justify-center gap-1">
                  <Minus className="w-5 h-5" /> {priceStable} Jenis
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4 print:hidden">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sayuran (misal: Cabai, Bawang)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'public' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVegetables.length > 0 ? (
              filteredVegetables.map((veg) => {
                const { diff, percent } = calculateChange(veg.todayPrice, veg.yesterdayPrice);
                const isHigher = diff > 0;
                const isLower = diff < 0;

                return (
                  <div
                    key={veg.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isHigher ? 'bg-emerald-500' : isLower ? 'bg-rose-500' : 'bg-slate-300'
                    }`}></div>

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {veg.category}
                            </span>
                            {veg.stock && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                veg.stock === 'Dibutuhkan Banyak' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {veg.stock}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg mt-1 group-hover:text-emerald-600 transition-colors">
                            {veg.name}
                          </h3>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isHigher
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isLower
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isHigher ? (
                            <>
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+{percent}%</span>
                            </>
                          ) : isLower ? (
                            <>
                              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                              <span>{percent}%</span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-3.5 h-3.5 text-slate-500" />
                              <span>Stabil</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="my-3 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                        <span className="text-[11px] text-emerald-800 font-bold block mb-0.5 uppercase tracking-wide">
                          Harga Beli Koperasi
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-emerald-950 tracking-tight">
                            {formatRupiah(veg.todayPrice)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700">/ {veg.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                        <div>
                          <span>Kemarin: </span>
                          <span className="font-semibold text-slate-700">{formatRupiah(veg.yesterdayPrice)}</span>
                        </div>
                        <div className={`font-bold ${
                          isHigher ? 'text-emerald-600' : isLower ? 'text-rose-600' : 'text-slate-500'
                        }`}>
                          {isHigher ? `+${formatRupiah(diff)}` : isLower ? formatRupiah(diff) : 'Sama'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 print:hidden">
                        <button
                          onClick={() => setSelectedChartVeg(veg)}
                          className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <LineChart className="w-3.5 h-3.5" /> Tren
                        </button>
                        <button
                          onClick={() => setSellModalVeg(veg)}
                          className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Setor Panen
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Sayuran tidak ditemukan.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Tabel Kelola Harga Beli Koperasi ({filteredVegetables.length} Jenis)
              </h3>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Ekspor ke Excel (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 sm:px-6">Nama Sayuran</th>
                    <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                    <th className="py-3.5 px-4 sm:px-6">Status Kebutuhan</th>
                    <th className="py-3.5 px-4 sm:px-6">Harga Beli Kemarin</th>
                    <th className="py-3.5 px-4 sm:px-6">Harga Beli Hari Ini</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVegetables.map((veg) => {
                    const isEditing = editingId === veg.id;

                    return (
                      <tr key={veg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                          {veg.name}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                            {veg.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          {isEditing ? (
                            <select
                              value={editPrices.stock}
                              onChange={(e) => setEditPrices({ ...editPrices, stock: e.target.value })}
                              className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold"
                            >
                              <option value="Dibutuhkan Banyak">Dibutuhkan Banyak</option>
                              <option value="Sedang">Sedang</option>
                              <option value="Cukup">Cukup</option>
                            </select>
                          ) : (
                            <span className={`text-xs font-bold ${
                              veg.stock === 'Dibutuhkan Banyak' ? 'text-amber-700' : 'text-slate-600'
                            }`}>
                              {veg.stock || 'Sedang'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-600">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPrices.yesterdayPrice}
                              onChange={(e) => setEditPrices({ ...editPrices, yesterdayPrice: Number(e.target.value) })}
                              className="w-28 px-2.5 py-1 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          ) : (
                            formatRupiah(veg.yesterdayPrice)
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-extrabold text-emerald-700">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPrices.todayPrice}
                              onChange={(e) => setEditPrices({ ...editPrices, todayPrice: Number(e.target.value) })}
                              className="w-28 px-2.5 py-1 border border-emerald-500 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          ) : (
                            formatRupiah(veg.todayPrice)
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-center">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(veg.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                            >
                              Simpan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(veg)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 mx-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Harga
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Setor Panen */}
      {sellModalVeg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSellModalVeg(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Setor Panen ke Koperasi</h3>
                <p className="text-xs text-slate-500">Konfirmasi rencana penjualan sayuran Anda</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 mb-4">
              <span className="text-xs text-emerald-700 font-bold block">{sellModalVeg.name}</span>
              <span className="text-xl font-black text-emerald-950">
                {formatRupiah(sellModalVeg.todayPrice)} <span className="text-xs font-medium">/ {sellModalVeg.unit}</span>
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Anggota Petani</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perkiraan Berat Hasil Panen (kg)</label>
                <input
                  type="number"
                  value={sellWeight}
                  onChange={(e) => setSellWeight(e.target.value)}
                  placeholder="Misal: 50"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={includeSaprotan}
                    onChange={(e) => setIncludeSaprotan(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Percent className="w-4 h-4 text-amber-600" /> Ada Potongan Bon Saprotan/Bibit?
                  </span>
                </label>

                {includeSaprotan && (
                  <input
                    type="number"
                    value={saprotanDeduction}
                    onChange={(e) => setSaprotanDeduction(e.target.value)}
                    placeholder="Masukkan jumlah potongan Rp..."
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {Number(sellWeight) > 0 && (
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-800 font-semibold block">Total Estimasi Penerimaan Bersih:</span>
                  <span className="text-xl font-black text-emerald-950">
                    {formatRupiah(Math.max(0, (Number(sellWeight) * sellModalVeg.todayPrice) - (includeSaprotan ? Number(saprotanDeduction) : 0)))}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSendSetorWA}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim Konfirmasi ke WA Gudang
            </button>
          </div>
        </div>
      )}

      {/* Modal Grafik Tren */}
      {selectedChartVeg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedChartVeg(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{selectedChartVeg.name}</h3>
                <p className="text-xs text-slate-500">Riwayat Harga Beli Koperasi 7 Hari Terakhir</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 my-4">
              <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                {(selectedChartVeg.history || [selectedChartVeg.yesterdayPrice, selectedChartVeg.todayPrice]).map((val, idx) => {
                  const maxHist = Math.max(...(selectedChartVeg.history || [selectedChartVeg.todayPrice]));
                  const minHist = Math.min(...(selectedChartVeg.history || [selectedChartVeg.todayPrice]));
                  const heightPercent = maxHist === minHist ? 50 : Math.max(20, Math.min(100, ((val - minHist) / (maxHist - minHist)) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow border border-slate-100 mb-1">
                        {(val / 1000).toFixed(0)}k
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          idx === 6 ? 'bg-emerald-600' : 'bg-slate-300 group-hover:bg-emerald-400'
                        }`}
                      ></div>
                      <span className="text-[10px] text-slate-400 mt-1">H-{6 - idx}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
                <span>7 Hari Lalu</span>
                <span>Hari Ini</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
              <span>Harga Terendah: <b>{formatRupiah(Math.min(...(selectedChartVeg.history || [selectedChartVeg.todayPrice])))}</b></span>
              <span>Harga Tertinggi: <b>{formatRupiah(Math.max(...(selectedChartVeg.history || [selectedChartVeg.todayPrice])))}</b></span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kalkulator */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCalculator(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Kalkulator Hasil Panen</h3>
                <p className="text-xs text-slate-500">Hitung total pendapatan dari penjualan ke koperasi</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Komoditas Sayuran</label>
                <select
                  value={calcVegId}
                  onChange={(e) => setCalcVegId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {vegetables.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({formatRupiah(v.todayPrice)}/{v.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Jumlah Panen (Kg)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Masukkan jumlah kg..."
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center my-2">
                <span className="text-xs text-emerald-700 font-semibold block">Total Uang Yang Akan Diterima</span>
                <span className="text-2xl font-black text-emerald-800 tracking-tight block mt-1">
                  {formatRupiah(totalCalcIncome)}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">
                  ({calcWeight || 0} kg × {formatRupiah(selectedCalcVeg.todayPrice)})
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCalculator(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all"
            >
              Tutup Kalkulator
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Sayur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-slate-900 mb-4">Tambah Komoditas Sayuran Baru</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sayuran</label>
                <input
                  type="text"
                  value={newVeg.name}
                  onChange={(e) => setNewVeg({ ...newVeg, name: e.target.value })}
                  placeholder="misal: Brokoli"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newVeg.category}
                    onChange={(e) => setNewVeg({ ...newVeg, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Daun">Daun</option>
                    <option value="Cabai">Cabai</option>
                    <option value="Buah">Buah</option>
                    <option value="Polong">Polong</option>
                    <option value="Bunga">Bunga</option>
                    <option value="Biji">Biji</option>
                    <option value="Bumbu & Daun">Bumbu & Daun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={newVeg.unit}
                    onChange={(e) => setNewVeg({ ...newVeg, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Beli Kemarin (Rp)</label>
                  <input
                    type="number"
                    value={newVeg.yesterdayPrice}
                    onChange={(e) => setNewVeg({ ...newVeg, yesterdayPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Beli Hari Ini (Rp)</label>
                  <input
                    type="number"
                    value={newVeg.todayPrice}
                    onChange={(e) => setNewVeg({ ...newVeg, todayPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-emerald-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kebutuhan Gudang</label>
                <select
                  value={newVeg.stock}
                  onChange={(e) => setNewVeg({ ...newVeg, stock: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Dibutuhkan Banyak">Dibutuhkan Banyak</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Cukup">Cukup</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleAddVegetable}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}