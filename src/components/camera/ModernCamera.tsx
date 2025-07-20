// components/camera/ModernCamera.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Camera, RefreshCcw, X, Check, FlipHorizontal } from 'lucide-react';

// --- PERUBAHAN 1: Ubah tipe onCapture untuk menerima objek hasil ---
interface ModernCameraProps {
    onCapture: (result: { imageFile: File; isWfh: 0 | 1; }) => void;
    onClose: () => void;
}

const filters = [
    { name: 'Normal', class: '' },
    { name: 'Grayscale', class: 'grayscale' },
    { name: 'Sepia', class: 'sepia' },
    { name: 'Invert', class: 'invert' },
];

const cssFilterMap: { [key: string]: string } = {
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    invert: 'invert(100%)',
};

// Fungsi helper untuk konversi Base64 ke File
function dataURLtoFile(dataurl: string, filename: string): File | null {
    try {
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;

        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) return null;
        const mime = mimeMatch[1];

        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (error) {
        console.error("Error converting data URL to File:", error);
        return null;
    }
}

export function ModernCamera({ onCapture, onClose }: ModernCameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [activeFilter, setActiveFilter] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isMirrored, setIsMirrored] = useState(true);
    console.log(facingMode);

    // --- PERUBAHAN 2: Tambahkan state untuk toggle WFH, default 0 (false) ---
    const [isWfh, setIsWfh] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            if (activeFilter && cssFilterMap[activeFilter]) {
                ctx.filter = cssFilterMap[activeFilter];
            }
            ctx.drawImage(image, 0, 0);
            const processedImageSrc = canvas.toDataURL('image/jpeg');
            setCapturedImage(processedImageSrc);
        };
    }, [webcamRef, activeFilter, isMirrored]);

    // --- PERUBAHAN 3: Ubah handleConfirm untuk mengirim objek hasil ---
    const handleConfirm = () => {
        if (capturedImage) {
            const fileName = `capture-${Date.now()}.jpg`;
            const imageFile = dataURLtoFile(capturedImage, fileName);
            const wfhValue = isWfh ? 1 : 0;

            if (imageFile) {
                // Kirim objek yang berisi File dan status WFH
                onCapture({ imageFile, isWfh: wfhValue });
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const toggleCamera = () => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    };

    const toggleMirror = () => {
        setIsMirrored((prev) => !prev);
    };

    const livePreviewClasses = `${activeFilter} ${isMirrored ? 'scale-x-[-1]' : ''}`.trim();

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
            <Button onClick={onClose} variant="ghost" className="absolute top-4 right-4 z-20 text-white hover:text-white">
                <X size={32} />
            </Button>
            {capturedImage ? (
                // Tampilan Konfirmasi
                <>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 z-10 flex w-full justify-around items-center p-4 bg-black bg-opacity-50">
                        <Button onClick={handleRetake} variant="ghost" className="text-white hover:text-white text-lg">
                            <RefreshCcw size={28} className="mr-2" />
                            Retake
                        </Button>
                        <Button onClick={handleConfirm} size="lg" className="text-white text-lg bg-green-500 hover:bg-green-600">
                            <Check size={28} className="mr-2" />
                            Confirm
                        </Button>
                    </div>
                </>
            ) : (
                // Tampilan Kamera Live
                <>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className={`h-full w-full object-cover ${livePreviewClasses}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-4 bg-black bg-opacity-50 z-10">
                        {/* Pilihan Filter */}
                        <div className="flex space-x-2 mb-4">
                            {filters.map((filter) => (
                                <Button
                                    key={filter.name}
                                    variant={activeFilter === filter.class ? 'secondary' : 'ghost'}
                                    className={
                                        activeFilter === filter.class
                                            ? 'text-black font-semibold' : 'text-white'
                                    }
                                    onClick={() => setActiveFilter(filter.class)}
                                >
                                    {filter.name}
                                </Button>
                            ))}
                        </div>

                        {/* --- PERUBAHAN 4: Tambahkan UI untuk Toggle WFH --- */}
                        <div className="flex items-center space-x-2 mb-4 rounded-md bg-black/30 p-2">
                            <Label htmlFor="wfh-toggle" className="text-white">
                                Work From Home
                            </Label>
                            <Switch
                                id="wfh-toggle"
                                checked={isWfh}
                                onCheckedChange={setIsWfh}
                            />
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex w-full justify-around items-center">
                            <Button onClick={toggleCamera} variant="ghost" className="text-white hover:text-white">
                                <RefreshCcw size={28} />
                            </Button>
                            <Button onClick={capture} size="lg" className="rounded-full h-20 w-20 p-0 border-4 border-white">
                                <Camera className="h-10 w-10" />
                            </Button>
                            <Button
                                onClick={toggleMirror}
                                variant={isMirrored ? 'secondary' : 'ghost'}
                                className={isMirrored ? 'text-black' : 'text-white'}
                            >
                                <FlipHorizontal size={28} />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}