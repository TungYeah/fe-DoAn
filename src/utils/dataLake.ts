import axios from "axios";


export async function countDataLake(payload: any): Promise<number> {
  const res = await axios.post(
    "http://localhost:8080/api/v1/data-query/lake",
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!Array.isArray(res.data)) return 0;

  const uniqueSet = new Set<string>();

  res.data.forEach((item: any) => {
    if (item.deviceId && item.timestamp) {
      uniqueSet.add(`${item.deviceId}_${item.timestamp}`);
    }
  });

  return uniqueSet.size;
}

