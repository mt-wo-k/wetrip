export type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportation: string;
  coverImagePath: string;
};

const trips: Trip[] = [
  {
    id: "2f3d7b2a-0a4d-4b2e-9d2f-2f4a6a4e6c10",
    title: "古都の夕景と歴史散策",
    destination: "京都",
    startDate: "2026-03-10",
    endDate: "2026-03-12",
    transportation: "新幹線",
    coverImagePath: "/trips/kyoto.png",
  },
  {
    id: "7c1e2f3a-9b10-4d21-8caa-1b2c3d4e5f60",
    title: "海風とリゾート時間",
    destination: "沖縄",
    startDate: "2026-04-05",
    endDate: "2026-04-08",
    transportation: "飛行機",
    coverImagePath: "/trips/kyoto.png",
  },
  {
    id: "c0a8017e-5d2b-4f4f-9f6b-3a2b1c0d9e8f",
    title: "大地と食のロードトリップ",
    destination: "北海道",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    transportation: "レンタカー",
    coverImagePath: "/trips/kyoto.png",
  },
];

export function getTrips() {
  return trips;
}

export function getTripById(id: string) {
  return trips.find((trip) => trip.id === id) ?? null;
}
