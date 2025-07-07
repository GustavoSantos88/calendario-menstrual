document.addEventListener('DOMContentLoaded', function () {
    function getStorageKey(year, month) {
        const mm = (month + 1).toString().padStart(2, '0');
        return `ciclo_${year}_${mm}`;
    }

    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();
    let cicloAtual = { inicio: null, fim: null };

    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        selectable: false,

        datesSet(info) {
            mesAtual = info.start.getMonth();
            anoAtual = info.start.getFullYear();
            carregarCiclo();
            atualizarEventos();
        },

        dateClick(info) {
            const dataSelecionada = info.dateStr;
            const dataSelecionadaDate = new Date(dataSelecionada);
            const inicioDate = cicloAtual.inicio ? new Date(cicloAtual.inicio) : null;
            const fimDate = cicloAtual.fim ? new Date(cicloAtual.fim) : null;

            if (!cicloAtual.inicio) {
                cicloAtual.inicio = dataSelecionada;
                salvarCiclo();
                atualizarEventos();
                return;
            }

            if (cicloAtual.inicio === dataSelecionada) {
                removerCiclo();
                cicloAtual = { inicio: null, fim: null };
                atualizarEventos();
                return;
            }

            if (!cicloAtual.fim) {
                if (dataSelecionadaDate < inicioDate) {
                    alert('O fim não pode ser antes do início');
                    return;
                }
                cicloAtual.fim = dataSelecionada;
                salvarCiclo();
                atualizarEventos();
                return;
            }

            if (cicloAtual.fim === dataSelecionada) {
                cicloAtual.fim = null;
                salvarCiclo();
                atualizarEventos();
                return;
            }

            if (dataSelecionadaDate > inicioDate) {
                if (fimDate) {
                    const inicioMes = inicioDate.getMonth();
                    const fimMes = fimDate.getMonth();
                    const selecaoMes = dataSelecionadaDate.getMonth();
                    const inicioAno = inicioDate.getFullYear();
                    const fimAno = fimDate.getFullYear();
                    const selecaoAno = dataSelecionadaDate.getFullYear();

                    if (inicioMes === fimMes && inicioAno === fimAno) {
                        if (selecaoMes !== inicioMes || selecaoAno !== inicioAno) {
                            alert('Para marcar fim em mês diferente, você precisa começar um novo ciclo (remova o atual primeiro).');
                            return;
                        }
                    }
                }

                cicloAtual.fim = dataSelecionada;
                salvarCiclo();
                atualizarEventos();
                return;
            }

            if (dataSelecionadaDate < inicioDate) {
                cicloAtual.inicio = dataSelecionada;
                if (fimDate && fimDate < dataSelecionadaDate) {
                    cicloAtual.fim = null;
                }
                salvarCiclo();
                atualizarEventos();
                return;
            }
        },

        events: []
    });

    function carregarCiclo() {
        const key = getStorageKey(anoAtual, mesAtual);
        const data = JSON.parse(localStorage.getItem(key));
        cicloAtual = data || { inicio: null, fim: null };
    }

    function salvarCiclo() {
        const key = getStorageKey(anoAtual, mesAtual);
        localStorage.setItem(key, JSON.stringify(cicloAtual));
    }

    function removerCiclo() {
        const key = getStorageKey(anoAtual, mesAtual);
        localStorage.removeItem(key);
    }

    function atualizarEventos() {
        calendar.removeAllEvents();

        if (!cicloAtual.inicio) {
            calendar.render();
            return;
        }

        calendar.addEvent({
            id: 'inicio',
            title: 'Início',
            start: cicloAtual.inicio,
            allDay: true,
            color: '#f87171',
        });

        if (cicloAtual.fim) {
            const fimMaisUm = new Date(cicloAtual.fim);
            fimMaisUm.setDate(fimMaisUm.getDate() + 1);

            calendar.addEvent({
                id: 'fim',
                title: 'Fim',
                start: cicloAtual.fim,
                allDay: true,
                color: '#f87171',
            });

            calendar.addEvent({
                id: 'ciclo',
                title: 'Ciclo',
                start: cicloAtual.inicio,
                end: fimMaisUm.toISOString().split('T')[0],
                allDay: true,
                color: '#fca5a5',
            });
        }

        calendar.render();
    }

    calendar.render();
    carregarCiclo();
    atualizarEventos();
});