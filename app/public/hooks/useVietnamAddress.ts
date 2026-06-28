import { useState, useEffect } from "react";

export interface VNProvince {
  code: number;
  name: string;
}
export interface VNDistrict {
  code: number;
  name: string;
}
export interface VNWard {
  code: number;
  name: string;
}

const BASE = "https://provinces.open-api.vn/api";

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<VNProvince[]>([]);
  const [districts, setDistricts] = useState<VNDistrict[]>([]);
  const [wards, setWards] = useState<VNWard[]>([]);
  const [provinceCode, setProvinceCodeState] = useState<number | null>(null);
  const [districtCode, setDistrictCodeState] = useState<number | null>(null);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  // ── Load danh sách tỉnh một lần duy nhất ──────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/p/`)
      .then((r) => r.json())
      .then((data: VNProvince[]) => setProvinces(data))
      .catch(() => setProvinces([]));
  }, []);

  // ── Load huyện khi tỉnh thay đổi ─────────────────────────────────────
  useEffect(() => {
    if (provinceCode === null) {
      {
        /* eslint-disable-next-line  */
      }
      setDistricts([]);
      setWards([]);
      return;
    }
    setDistrictLoading(true);
    setDistricts([]);
    setWards([]);
    setDistrictCodeState(null);
    fetch(`${BASE}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data: any) => {
        setDistricts(data.districts || []);
        setDistrictLoading(false);
      })
      .catch(() => setDistrictLoading(false));
  }, [provinceCode]);

  // ── Load xã/phường khi huyện thay đổi ────────────────────────────────
  useEffect(() => {
    if (districtCode === null) {
      {
        /* eslint-disable-next-line  */
      }
      setWards([]);
      return;
    }
    setWardLoading(true);
    setWards([]);
    fetch(`${BASE}/d/${districtCode}?depth=2`)
      .then((r) => r.json())
      .then((data: any) => {
        setWards(data.wards || []);
        setWardLoading(false);
      })
      .catch(() => setWardLoading(false));
  }, [districtCode]);

  // ── Setters với cascade reset ─────────────────────────────────────────
  const setProvinceCode = (code: number | null) => {
    setProvinceCodeState(code);
    setDistrictCodeState(null);
  };

  const setDistrictCode = (code: number | null) => {
    setDistrictCodeState(code);
  };

  /** Reset toàn bộ về trạng thái ban đầu */
  const resetVN = () => {
    setProvinceCodeState(null);
    setDistrictCodeState(null);
    setDistricts([]);
    setWards([]);
  };

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    setProvinceCode,
    districtCode,
    setDistrictCode,
    districtLoading,
    wardLoading,
    resetVN,
  };
}
