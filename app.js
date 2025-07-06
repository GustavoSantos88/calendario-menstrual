document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'ciclos_menstruais';
  const savedEvents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  const calendarEl = document.getElementById('calendar');
  let startDate = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    selectable: true,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    select: function (info) {
      const clickedDate = info.startStr;

      // Primeiro clique → marca como início
      if (!startDate) {
        startDate = clickedDate;

        calendar.addEvent({
          title: 'Início',
          start: clickedDate,
          allDay: true,
          color: '#f87171'
        });

      } else {
        // Segundo clique → considera como fim e salva ciclo completo
        const endDate = clickedDate;

        const cycleEvent = {
          title: 'Ciclo',
          start: startDate,
          end: addOneDay(endDate),
          allDay: true
        };

        // Remove evento "Início" temporário
        calendar.getEvents().forEach(event => {
          if (event.title === 'Início') {
            event.remove();
          }
        });

        calendar.addEvent(cycleEvent);
        savedEvents.push(cycleEvent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEvents));
        startDate = null;
      }
    },
    events: savedEvents
  });

  calendar.render();

  function addOneDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
});