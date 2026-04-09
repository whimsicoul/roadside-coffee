export interface PickupSlot {
  label: string;
  value: string; // ISO 8601
}

/** Returns available 15-minute pickup slots for today between 6 AM and 3 PM.
 *  Only includes slots that are still in the future. */
export function getAvailablePickupSlots(): PickupSlot[] {
  const now = new Date();
  const slots: PickupSlot[] = [];

  const OPEN_HOUR = 6;
  const CLOSE_HOUR = 15; // 3 PM — no slots at or after this hour

  // Round up current time to next 15-min boundary
  const startMinutes =
    Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;

  for (
    let totalMinutes = Math.max(startMinutes, OPEN_HOUR * 60);
    totalMinutes < CLOSE_HOUR * 60;
    totalMinutes += 15
  ) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    const slotDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0
    );

    const label = slotDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    slots.push({ label, value: slotDate.toISOString() });
  }

  return slots;
}
