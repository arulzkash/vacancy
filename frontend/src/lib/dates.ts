const indonesianDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function formatPublishedDate(timestamp: string): string {
  return indonesianDateFormatter.format(new Date(timestamp));
}

export function formatClosingDate(date: string): string {
  // A closing date represents a calendar day in WIB, not a UTC timestamp.
  const midnightInJakarta = new Date(`${date}T00:00:00+07:00`);

  return indonesianDateFormatter.format(midnightInJakarta);
}
