import os

salons = [
    {"id": "beaute", "icon": "fa-user-circle"},
    {"id": "chic", "icon": "fa-user-tie"},
    {"id": "elegance", "icon": "fa-user-astronaut"},
    {"id": "moderne", "icon": "fa-user"},
    {"id": "studio", "icon": "fa-user-ninja"}
]

script_template = """
    <script>
        var SALON_ID = '{SALON_ID}';
        var coiffeurs = [];
        var selectedCoiffeur = null;
        var selectedDate = null;
        var selectedTime = null;
        var formSubmitting = false;

        async function getCoiffeurs() {
            try {
                const response = await fetch('/api/api-coiffeurs?salon_id=' + SALON_ID);
                if (!response.ok) throw new Error('Erreur chargement coiffeurs');
                return await response.json();
            } catch (e) {
                console.error(e);
                return [];
            }
        }

        function scrollToBooking() {
            document.getElementById('booking-section').scrollIntoView({behavior: 'smooth'});
        }

        function goToStep(step) {
            var steps = document.querySelectorAll('.step-content');
            for (var i = 0; i < steps.length; i++) {
                steps[i].classList.remove('active');
            }
            document.getElementById('step-' + step).classList.add('active');

            var progressSteps = document.querySelectorAll('.progress-step');
            for (var j = 0; j < progressSteps.length; j++) {
                progressSteps[j].classList.remove('active');
                if (j === step - 1) {
                    progressSteps[j].classList.add('active');
                }
            }

            if (step === 2) loadCalendar();
            if (step === 3) loadTimeSlots();
        }

        async function renderCoiffeurs() {
            var container = document.getElementById('coiffeurs-list');
            container.innerHTML = '<p style="text-align:center; width:100%; color:var(--gray);">Chargement des experts...</p>';

            coiffeurs = await getCoiffeurs();
            container.innerHTML = '';

            var activeCoiffeurs = coiffeurs.filter(function(c) { return c.actif; });

            if (activeCoiffeurs.length === 0) {
                container.innerHTML = '<p style="text-align:center; width:100%; color:var(--gray);">Aucun expert disponible pour le moment.</p>';
                return;
            }

            for (var i = 0; i < activeCoiffeurs.length; i++) {
                var coiffeur = activeCoiffeurs[i];
                var card = document.createElement('div');
                card.className = 'coiffeur-card';
                card.setAttribute('data-id', coiffeur.id);
                card.innerHTML = '<div style="font-size:2rem; margin-bottom:0.5rem"><i class="fa-solid {USER_ICON}"></i></div>' +
                                '<h3 style="font-size:1.1rem; margin-bottom:0.25rem">' + coiffeur.prenom + ' ' + coiffeur.nom + '</h3>' +
                                '<p style="font-size:0.9rem; color:var(--gray)">' + coiffeur.specialite + '</p>';
                card.onclick = function() {
                    selectCoiffeur(this);
                };
                container.appendChild(card);
            }
        }

        function selectCoiffeur(element) {
            var cards = document.querySelectorAll('.coiffeur-card');
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.remove('selected');
            }
            element.classList.add('selected');
            selectedCoiffeur = parseInt(element.getAttribute('data-id'));
            document.getElementById('btn-next-1').disabled = false;
        }

        function loadCalendar() {
            var container = document.getElementById('calendar');
            container.innerHTML = '';
            var today = new Date();
            today.setHours(0, 0, 0, 0);

            for (var i = 0; i < 7; i++) {
                var date = new Date(today);
                date.setDate(today.getDate() + i);

                var day = document.createElement('div');
                day.className = 'calendar-day';
                
                var year = date.getFullYear();
                var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
                var dayNum = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                var dateStr = year + '-' + month + '-' + dayNum;
                day.setAttribute('data-date', dateStr);

                var dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                var monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

                day.innerHTML = '<div style="font-size:0.8rem; text-transform:uppercase; margin-bottom:0.25rem">' + dayNames[date.getDay()] + '</div>' +
                               '<div style="font-size: 1.2rem; font-weight: bold;">' + date.getDate() + '</div>';

                day.onclick = function() {
                    if (!this.classList.contains('disabled')) selectDate(this);
                };
                container.appendChild(day);
            }
        }

        function selectDate(element) {
            var days = document.querySelectorAll('.calendar-day');
            for (var i = 0; i < days.length; i++) {
                days[i].classList.remove('selected');
            }
            element.classList.add('selected');
            selectedDate = element.getAttribute('data-date');
            document.getElementById('btn-next-2').disabled = false;
        }

        function loadTimeSlots() {
            var container = document.getElementById('time-slots');
            container.innerHTML = '';
            var hours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];

            var now = new Date();
            var selectedDateObj = new Date(selectedDate + 'T00:00:00');
            var isToday = selectedDateObj.toDateString() === now.toDateString();

            for (var j = 0; j < hours.length; j++) {
                var slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.setAttribute('data-time', hours[j]);
                slot.textContent = hours[j];

                if (isToday) {
                    var slotHour = parseInt(hours[j].split(':')[0]);
                    var slotMinute = parseInt(hours[j].split(':')[1]);
                    var currentHour = now.getHours();
                    var currentMinute = now.getMinutes();

                    if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                        slot.classList.add('disabled');
                        continue;
                    }
                }

                slot.onclick = function() {
                    selectTime(this);
                };

                container.appendChild(slot);
            }
        }

        function selectTime(element) {
            if (element.classList.contains('disabled')) return;

            var slots = document.querySelectorAll('.time-slot');
            for (var i = 0; i < slots.length; i++) {
                slots[i].classList.remove('selected');
            }
            element.classList.add('selected');
            selectedTime = element.getAttribute('data-time');
            document.getElementById('btn-next-3').disabled = false;
        }

        document.getElementById('booking-form').addEventListener('submit', function(event) {
            event.preventDefault();

            if (formSubmitting) {
                return;
            }

            var telInput = document.getElementById('telephone');
            var telError = document.getElementById('tel-error');
            var telValue = telInput.value.trim();

            var phoneRegex = /^0[1-9][0-9]{8}$/;

            if (!phoneRegex.test(telValue)) {
                telInput.classList.add('error');
                telError.classList.add('show');
                return;
            }

            telInput.classList.remove('error');
            telError.classList.remove('show');

            formSubmitting = true;
            var submitBtn = document.getElementById('btn-submit');
            var originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traitement...';

            submitBooking().then(function() {
                formSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        });

        async function submitBooking() {
            var prenom = document.getElementById('prenom').value;
            var nom = document.getElementById('nom').value;
            var tel = document.getElementById('telephone').value;

            var coiffeur = null;
            for (var i = 0; i < coiffeurs.length; i++) {
                if (coiffeurs[i].id === selectedCoiffeur) {
                    coiffeur = coiffeurs[i];
                    break;
                }
            }

            var dateObj = new Date(selectedDate);
            var dateStr = dateObj.toLocaleDateString('fr-FR', {
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
            });

            try {
                const response = await fetch('/api/api-bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        salon_id: SALON_ID,
                        date: selectedDate,
                        heure: selectedTime,
                        client_prenom: prenom,
                        client_nom: nom,
                        client_tel: tel,
                        coiffeur_id: selectedCoiffeur
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
                }

                document.getElementById('confirmation-details').innerHTML = 
                    '<p><strong><i class="fa-solid fa-user"></i> Client :</strong> ' + prenom + ' ' + nom + '</p>' +
                    '<p><strong><i class="fa-solid fa-scissors"></i> Expert :</strong> ' + coiffeur.prenom + ' ' + coiffeur.nom + '</p>' +
                    '<p><strong><i class="fa-regular fa-calendar"></i> Date :</strong> ' + dateStr + '</p>' +
                    '<p><strong><i class="fa-regular fa-clock"></i> Heure :</strong> ' + selectedTime + '</p>';

                document.getElementById('modal-confirmation').classList.add('active');
            } catch (e) {
                console.error(e);
                alert("Erreur : " + e.message);
            }
        }

        function resetBooking() {
            document.getElementById('modal-confirmation').classList.remove('active');
            document.getElementById('booking-form').reset();
            selectedCoiffeur = null;
            selectedDate = null;
            selectedTime = null;
            formSubmitting = false;

            document.getElementById('btn-next-1').disabled = true;
            document.getElementById('btn-next-2').disabled = true;
            document.getElementById('btn-next-3').disabled = true;

            var cards = document.querySelectorAll('.coiffeur-card, .calendar-day, .time-slot');
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.remove('selected');
            }

            goToStep(1);
        }

        document.getElementById('telephone').addEventListener('input', function(e) {
            var telError = document.getElementById('tel-error');
            var value = e.target.value.trim();

            e.target.value = value.replace(/[^0-9]/g, '');

            if (e.target.value.length > 0 && e.target.value.length < 10) {
                e.target.classList.add('error');
                telError.classList.add('show');
            } else if (e.target.value.length === 10 && /^0[1-9][0-9]{8}$/.test(e.target.value)) {
                e.target.classList.remove('error');
                telError.classList.remove('show');
            }
        });

        document.getElementById('btn-next-1').addEventListener('click', function() { goToStep(2); });
        document.getElementById('btn-next-2').addEventListener('click', function() { goToStep(3); });
        document.getElementById('btn-next-3').addEventListener('click', function() { goToStep(4); });

        window.onload = function() {
            renderCoiffeurs();
        };
    </script>
</body>
</html>
"""

for salon in salons:
    file_path = f"{salon['id']}/index.html"
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Find the start of the script tag
        start_idx = content.find("<script>")
        if start_idx != -1:
            # Keep everything before the script tag
            new_content = content[:start_idx]
            # Append the new script
            new_script = script_template.replace("{SALON_ID}", salon["id"]).replace("{USER_ICON}", salon["icon"])
            new_content += new_script
            
            with open(file_path, "w") as f:
                f.write(new_content)
            print(f"Updated {file_path}")
        else:
            print(f"Could not find <script> tag in {file_path}")
    else:
        print(f"File not found: {file_path}")
