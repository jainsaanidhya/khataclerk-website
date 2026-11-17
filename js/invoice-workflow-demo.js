(function () {
    const demos = document.querySelectorAll('[data-invoice-workflow]');
    if (!demos.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    demos.forEach((demo) => {
        const playButton = demo.querySelector('[data-play-workflow]');
        const announcement = demo.querySelector('[data-workflow-announcement]');
        const steps = ['scan', 'extract', 'review', 'send'];
        let timers = [];

        if (!playButton) return;

        function clearTimers() {
            timers.forEach(window.clearTimeout);
            timers = [];
        }

        function setState(state) {
            demo.dataset.state = state;
            steps.forEach((name) => {
                const step = demo.querySelector(`[data-step="${name}"]`);
                if (!step) return;
                step.dataset.status = state === 'complete' || steps.indexOf(name) < steps.indexOf(state) ? 'done' : (name === state ? 'active' : 'pending');
            });
        }

        function announce(message) {
            if (announcement) announcement.textContent = message;
        }

        playButton.addEventListener('click', () => {
            clearTimers();
            playButton.disabled = true;
            playButton.textContent = 'Playing…';
            setState('scan');

            if (reducedMotion.matches) {
                setState('complete');
                announce('Illustrative workflow complete: invoice details were extracted, reviewed, and sent to Tally.');
                playButton.disabled = false;
                playButton.textContent = 'Replay workflow';
                return;
            }

            announce('Scanning the invoice.');
            const sequence = [
                { after: 1250, state: 'extract', message: 'Invoice fields extracted.' },
                { after: 2600, state: 'review', message: 'Extracted details reviewed.' },
                { after: 3900, state: 'send', message: 'Sending the reviewed entry to Tally.' },
                { after: 5200, state: 'complete', message: 'Illustrative workflow complete: entry sent to Tally.' }
            ];

            sequence.forEach(({ after, state, message }) => {
                timers.push(window.setTimeout(() => {
                    setState(state);
                    announce(message);
                    if (state === 'complete') {
                        playButton.disabled = false;
                        playButton.textContent = 'Replay workflow';
                    }
                }, after));
            });
        });
    });
}());
