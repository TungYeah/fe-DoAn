// src/components/ui/AddDeviceModal.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./select";

type NewDevice = {
  name: string;
  device_id: string;
  description: string;
  device_type_id: string;
};

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void; // gọi lại để refresh list ở DevicesPage
}

export default function AddDeviceModal({
  open,
  onClose,
  onAdded,
}: AddDeviceModalProps) {
  const [newDevice, setNewDevice] = useState<NewDevice>({
    name: "",
    device_id: "",
    description: "",
    device_type_id: "",
  });

  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
  const [selectedWard, setSelectedWard] = useState<any | null>(null);

  const [formError, setFormError] = useState("");

  // ========== LOAD DEVICE TYPES + PROVINCES ==========
  useEffect(() => {
    if (!open) return;
    loadDeviceTypes();
    loadProvinces();
  }, [open]);

  const loadDeviceTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/device-types");
      setDeviceTypes(res.data?.device_types || []);
    } catch (err) {
      console.error("Lỗi tải loại thiết bị:", err);
    }
  };

  const loadProvinces = async () => {
    try {
      const res = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(res.data || []);
    } catch (err) {
      console.error("Lỗi tải tỉnh:", err);
    }
  };

  const handleProvinceChange = async (code: string) => {
    const p = provinces.find((item) => String(item.code) === code) || null;
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    if (!code) return;
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${code}?depth=2`
      );
      setDistricts(res.data?.districts || []);
    } catch (err) {
      console.error("Lỗi tải quận:", err);
    }
  };

  const handleDistrictChange = async (code: string) => {
    const d = districts.find((item) => String(item.code) === code) || null;
    setSelectedDistrict(d);
    setSelectedWard(null);
    setWards([]);

    if (!code) return;
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${code}?depth=2`
      );
      setWards(res.data?.wards || []);
    } catch (err) {
      console.error("Lỗi tải xã:", err);
    }
  };

  const handleWardChange = (code: string) => {
    const w = wards.find((item) => String(item.code) === code) || null;
    setSelectedWard(w);
  };

  const addressText = [
    selectedWard?.name,
    selectedDistrict?.name,
    selectedProvince?.name,
  ]
    .filter(Boolean)
    .join(", ");

  // ========== SUBMIT ==========
  const handleSubmit = async () => {
    try {
      setFormError("");

      if (!newDevice.name || !newDevice.device_id || !newDevice.device_type_id) {
        setFormError("⚠️ Vui lòng nhập đủ thông tin bắt buộc.");
        return;
      }

      await axios.post("http://localhost:5000/api/add-device", {
        ...newDevice,
        user_id: 1,
        location: addressText || null,
        province: selectedProvince?.name || null,
        district: selectedDistrict?.name || null,
        ward: selectedWard?.name || null,
      });

      alert("✅ Thêm thiết bị thành công!");

      // reset form
      setNewDevice({
        name: "",
        device_id: "",
        description: "",
        device_type_id: "",
      });
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setDistricts([]);
      setWards([]);

      onClose();
      onAdded && onAdded();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Không thể thêm thiết bị. Thử lại sau.";
      setFormError(msg);
    }
  };

  if (!open) return null;

 if (!open) return null;

return (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
    {/* khung popup */}
    <div className="mt-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl border">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Thêm thiết bị mới
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Tên thiết bị */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tên thiết bị *
            </Label>
            <Input
              placeholder="Nhập tên thiết bị"
              value={newDevice.name}
              onChange={(e) =>
                setNewDevice((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          {/* Mã thiết bị */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Mã thiết bị *
            </Label>
            <Input
              placeholder="Ví dụ: IOT-001"
              value={newDevice.device_id}
              onChange={(e) =>
                setNewDevice((prev) => ({
                  ...prev,
                  device_id: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>

          {/* Loại thiết bị */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Loại thiết bị *
            </Label>
<Select
  value={newDevice.device_type_id}
  onValueChange={(v) =>
    setNewDevice((prev) => ({ ...prev, device_type_id: v }))
  }
>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn loại thiết bị" />
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-auto">
    {deviceTypes.map((t) => (
      <SelectItem key={t.id} value={String(t.id)}>
        {t.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Tỉnh / Thành phố
            </Label>
<Select
  value={selectedProvince ? String(selectedProvince.code) : ""}
  onValueChange={handleProvinceChange}
>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn tỉnh/thành" />
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-auto">
    {provinces.map((p) => (
      <SelectItem key={p.code} value={String(p.code)}>
        {p.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          {/* Quận / Huyện */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Quận / Huyện
            </Label>
<Select
  disabled={!selectedProvince}
  value={selectedDistrict ? String(selectedDistrict.code) : ""}
  onValueChange={handleDistrictChange}
>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn quận/huyện trước" />
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-auto">
    {districts.map((d) => (
      <SelectItem key={d.code} value={String(d.code)}>
        {d.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          {/* Xã / Phường */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Xã / Phường
            </Label>
<Select
  disabled={!selectedDistrict}
  value={selectedWard ? String(selectedWard.code) : ""}
  onValueChange={handleWardChange}
>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn xã/phường" />
  </SelectTrigger>
  <SelectContent className="max-h-60 overflow-auto">
    {wards.map((w) => (
      <SelectItem key={w.code} value={String(w.code)}>
        {w.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          {/* Địa chỉ gộp */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              Địa chỉ:
            </Label>
            <p className="mt-1 text-sm text-gray-700">
              {addressText || "Chưa chọn"}
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Mô tả</Label>
            <Textarea
              rows={3}
              placeholder="Mô tả thiết bị..."
              value={newDevice.description}
              onChange={(e) =>
                setNewDevice((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </div>
      </div>
    </div>
  );
}
