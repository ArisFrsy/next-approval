// src/components/layout/footer.tsx

export default function Footer() {
    return (
        <footer className="border-t p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Alfahuma. Semua Hak Cipta Dilindungi.
        </footer>
    );
}