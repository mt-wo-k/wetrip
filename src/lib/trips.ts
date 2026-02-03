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
    title: "京都・奈良旅行",
    destination: "京都・奈良",
    startDate: "2026-02-28",
    endDate: "2026-03-02",
    transportation: "車",
    coverImagePath: "/trips/kyoto.png",
  },
];

export function getTrips() {
  return trips;
}

export function getTripById(id: string) {
  return trips.find((trip) => trip.id === id) ?? null;
}
