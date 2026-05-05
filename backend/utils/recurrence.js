function calculateNextDue(dueDate, recurrence) {
  const base = dueDate ? new Date(dueDate) : new Date();
  const interval = Math.max(1, recurrence.interval || 1);

  switch (recurrence.frequency) {
    case 'daily': {
      const next = new Date(base);
      next.setDate(next.getDate() + interval);
      return next;
    }
    case 'weekly': {
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const next = new Date(base);
        next.setDate(next.getDate() + 1); // start search from tomorrow
        for (let i = 0; i < 7 * interval + 7; i++) {
          if (recurrence.daysOfWeek.includes(next.getDay())) return next;
          next.setDate(next.getDate() + 1);
        }
      }
      const next = new Date(base);
      next.setDate(next.getDate() + 7 * interval);
      return next;
    }
    case 'monthly': {
      const next = new Date(base);
      next.setMonth(next.getMonth() + interval);
      return next;
    }
    case 'yearly': {
      const next = new Date(base);
      next.setFullYear(next.getFullYear() + interval);
      return next;
    }
    default:
      return null;
  }
}

module.exports = { calculateNextDue };
