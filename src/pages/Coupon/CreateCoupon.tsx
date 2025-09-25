import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Coupon } from '../../types/index.tsx';

interface CreateCouponPageProps {
    coupons: Coupon[];
    setCoupons: (coupons: Coupon[]) => void;
}

interface NewCoupon {
    name: string;
    pointsRequired: string;
    description: string;
    validUntil?: string;
}

const CreateCouponPage: React.FC<CreateCouponPageProps> = ({ coupons, setCoupons }) => {
    const [newCoupon, setNewCoupon] = useState<NewCoupon>({
        name: '',
        pointsRequired: '',
        description: '',
        validUntil: ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const coupon: Coupon = {
            ...newCoupon,
            id: `C${String(coupons.length + 1).padStart(3, '0')}`,
            pointsRequired: parseInt(newCoupon.pointsRequired),
            isActive: true,
            validUntil: newCoupon.validUntil || undefined
        };

        setCoupons([...coupons, coupon]);
        setNewCoupon({ name: '', pointsRequired: '', description: '', validUntil: '' });
        alert('สร้างคูปองเรียบร้อยแล้ว');
    };

    const handleInputChange = (field: keyof NewCoupon) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        setNewCoupon(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">สร้างคูปอง</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อคูปอง</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.name}
                        onChange={handleInputChange('name')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนที่ต้องใช้</label>
                    <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.pointsRequired}
                        onChange={handleInputChange('pointsRequired')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                    <textarea
                        required
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.description}
                        onChange={handleInputChange('description')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุ (ถ้ามี)</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.validUntil}
                        onChange={handleInputChange('validUntil')}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        <Plus className="w-4 h-4" />
                        สร้างคูปอง
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCouponPage;