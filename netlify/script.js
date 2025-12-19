/**
 * Bandendepot - Offerte Formulier Validatie
 * Valideert het offerteformulier en toont feedback aan de gebruiker
 */

/**
 * Haalt automerk op basis van kenteken op
 * @param {string} kenteken - Het kenteken om op te zoeken
 */
function fetchAutomerkByKenteken(kenteken) {
    const automerkField = document.getElementById('automerk');
    if (!automerkField) {
        console.log('Automerk veld niet gevonden');
        return;
    }
    
    // Normaliseer kenteken
    const normalizedKenteken = kenteken.toUpperCase().replace(/\s/g, '');
    
    if (normalizedKenteken.length < 6) {
        console.log('Kenteken te kort:', normalizedKenteken);
        return;
    }
    
    // Toon loading state
    const originalPlaceholder = automerkField.placeholder || 'Automerk';
    automerkField.placeholder = 'Automerk ophalen...';
    automerkField.disabled = true;
    
    // Probeer eerst lokale database (sneller)
    const localResult = setAutomerkFromLocalDB(normalizedKenteken, automerkField, originalPlaceholder);
    if (localResult) {
        return; // Gevonden in lokale database
    }
    
    // Probeer RDW Open Data API
    fetch(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${encodeURIComponent(normalizedKenteken)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('API niet beschikbaar');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0 && data[0].merk) {
                automerkField.value = data[0].merk;
                automerkField.disabled = false;
                automerkField.placeholder = originalPlaceholder;
                console.log('Automerk gevonden via API:', data[0].merk);
            } else {
                // Geen resultaat van API
                automerkField.disabled = false;
                automerkField.placeholder = originalPlaceholder;
                console.log('Automerk niet gevonden voor kenteken:', normalizedKenteken);
            }
        })
        .catch(error => {
            // API fout - veld weer enabled maken
            automerkField.disabled = false;
            automerkField.placeholder = originalPlaceholder;
            console.log('API fout, automerk niet gevonden:', error);
        });
}

/**
 * Lokale database met veelvoorkomende kentekens en automerken
 * Dit is een fallback als de API niet beschikbaar is
 */
function setAutomerkFromLocalDB(kenteken, automerkField, originalPlaceholder) {
    // Lokale database met voorbeelden (kan uitgebreid worden)
    const kentekenDatabase = {
        // Voorbeelden - in productie zou dit uitgebreider zijn
        '12ABC3': 'Volkswagen',
        'AB12CD': 'BMW',
        'XY123Z': 'Mercedes-Benz',
        '12XYZ3': 'Audi',
        'AB123C': 'Ford',
        '12ABC4': 'Opel',
        'XY12AB': 'Peugeot',
        'AB12XY': 'Renault',
        '12XYZA': 'Toyota',
        // Meer voorbeelden voor testen
        'TEST01': 'Volkswagen',
        'TEST02': 'BMW',
        'DEMO01': 'Mercedes-Benz',
    };
    
    // Probeer exacte match
    if (kentekenDatabase[kenteken]) {
        automerkField.value = kentekenDatabase[kenteken];
        automerkField.disabled = false;
        automerkField.placeholder = originalPlaceholder || 'Automerk';
        console.log('Automerk gevonden in lokale database:', kentekenDatabase[kenteken]);
        return true; // Gevonden
    }
    
    // Als geen match gevonden, probeer patroon matching
    // Bijvoorbeeld: als kenteken begint met bepaalde patronen
    const kentekenPrefix = kenteken.substring(0, 2);
    const prefixDatabase = {
        '12': 'Volkswagen',
        'AB': 'BMW',
        'XY': 'Mercedes-Benz',
    };
    
    if (prefixDatabase[kentekenPrefix]) {
        automerkField.value = prefixDatabase[kentekenPrefix];
        automerkField.disabled = false;
        automerkField.placeholder = originalPlaceholder || 'Automerk';
        console.log('Automerk gevonden via prefix matching:', prefixDatabase[kentekenPrefix]);
        return true;
    }
    
    // Als geen match gevonden, return false zodat API geprobeerd kan worden
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('offerte-form');
    const formMessage = document.getElementById('form-message');
    const formFields = {
        naam: document.getElementById('naam'),
        telefoon: document.getElementById('telefoon'),
        email: document.getElementById('email'),
        kenteken: document.getElementById('kenteken'),
        automerk: document.getElementById('automerk'),
        bandenmaat: document.getElementById('bandenmaat')
    };
    
    // Debug: check of elementen gevonden zijn
    if (!form) {
        console.error('Formulier niet gevonden!');
        return;
    }
    if (!formMessage) {
        console.error('Form message element niet gevonden!');
        return;
    }
    console.log('Form en formMessage gevonden:', !!form, !!formMessage);

    /**
     * Toont een bericht aan de gebruiker
     * @param {string} message - Het bericht om weer te geven
     * @param {string} type - 'success' of 'error'
     */
    function showMessage(message, type) {
        if (!formMessage) {
            console.error('Form message element niet gevonden');
            return;
        }
        
        console.log('showMessage called:', message, type); // Debug log
        
        // Zet de tekst en class
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        
        // Zorg dat het zichtbaar is (override CSS display: none)
        formMessage.style.display = 'block';
        formMessage.style.visibility = 'visible';
        formMessage.style.opacity = '1';
        formMessage.style.marginTop = '1rem';
        formMessage.style.padding = '1rem';
        formMessage.style.borderRadius = '8px';
        formMessage.style.fontSize = '0.95rem';
        
        if (type === 'error') {
            formMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
            formMessage.style.color = '#F44336';
            formMessage.style.border = '1px solid #F44336';
        } else if (type === 'success') {
            formMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
            formMessage.style.color = '#4CAF50';
            formMessage.style.border = '1px solid #4CAF50';
        }
        
        // Scroll naar het bericht voor betere zichtbaarheid
        setTimeout(function() {
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        // Verberg het bericht na 5 seconden bij succes
        if (type === 'success') {
            setTimeout(function() {
                formMessage.className = 'form-message';
                formMessage.textContent = '';
                formMessage.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Valideert een e-mailadres
     * @param {string} email - Het e-mailadres om te valideren
     * @returns {boolean} - True als het e-mailadres geldig is
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valideert een Nederlands kenteken
     * @param {string} kenteken - Het kenteken om te valideren
     * @returns {boolean} - True als het kenteken geldig is
     */
    function validateKenteken(kenteken) {
        // Basis validatie: minstens 6 karakters, alleen letters en cijfers
        const kentekenRegex = /^[A-Z0-9]{6,8}$/i;
        return kentekenRegex.test(kenteken.replace(/\s/g, ''));
    }

    /**
     * Valideert een telefoonnummer
     * @param {string} telefoon - Het telefoonnummer om te valideren
     * @returns {boolean} - True als het telefoonnummer geldig is
     */
    function validateTelefoon(telefoon) {
        // Basis validatie: minstens 10 cijfers
        const cleaned = telefoon.replace(/[\s\-\(\)]/g, '');
        return /^[0-9]{10,}$/.test(cleaned);
    }

    /**
     * Valideert een bandenmaat
     * @param {string} bandenmaat - De bandenmaat om te valideren
     * @returns {boolean} - True als de bandenmaat geldig is
     */
    function validateBandenmaat(bandenmaat) {
        // Basis validatie: moet minimaal 5 karakters bevatten
        const trimmed = bandenmaat.trim();
        if (trimmed.length < 5) {
            return false;
        }
        // Check of het een geldig formaat heeft (bijv. 205/55 R16, 195/65 R15, etc.)
        // Flexibel patroon: cijfers/slash/cijfers (optionele spatie) R cijfers
        // Accepteert ook varianten zoals 205/55R16, 195/65 R15, etc.
        const bandenmaatRegex = /^\d{2,3}\/\d{2,3}\s*R\d{2,3}$/i;
        return bandenmaatRegex.test(trimmed);
    }

    /**
     * Valideert alle formuliervelden
     * @returns {object} - Object met isValid boolean en errorMessage string
     */
    function validateForm() {
        // Controleer of alle velden zijn ingevuld
        for (const [fieldName, field] of Object.entries(formFields)) {
            if (!field.value.trim()) {
                return {
                    isValid: false,
                    errorMessage: `Het veld "${field.getAttribute('placeholder')}" is verplicht.`
                };
            }
        }

        // Valideer naam (minimaal 2 karakters)
        const naamValue = formFields.naam.value.trim();
        if (naamValue.length < 2) {
            return {
                isValid: false,
                errorMessage: 'Naam moet minimaal 2 karakters bevatten.'
            };
        }

        // Valideer e-mailadres
        if (!validateEmail(formFields.email.value.trim())) {
            return {
                isValid: false,
                errorMessage: 'Voer een geldig e-mailadres in.'
            };
        }

        // Valideer telefoonnummer
        if (!validateTelefoon(formFields.telefoon.value.trim())) {
            return {
                isValid: false,
                errorMessage: 'Voer een geldig telefoonnummer in (minimaal 10 cijfers).'
            };
        }

        // Valideer kenteken
        if (!validateKenteken(formFields.kenteken.value.trim())) {
            return {
                isValid: false,
                errorMessage: 'Voer een geldig kenteken in (6-8 letters en cijfers).'
            };
        }

        // Valideer automerk (minimaal 2 karakters)
        const automerkValue = formFields.automerk.value.trim();
        if (automerkValue.length < 2) {
            return {
                isValid: false,
                errorMessage: 'Automerk moet minimaal 2 karakters bevatten.'
            };
        }

        // Valideer bandenmaat (optioneel, maar als ingevuld moet het geldig zijn)
        if (formFields.bandenmaat.value.trim() && !validateBandenmaat(formFields.bandenmaat.value.trim())) {
            return {
                isValid: false,
                errorMessage: 'Voer een geldig bandenmaat formaat in (bijv. 205/55 R16).'
            };
        }

        return {
            isValid: true,
            errorMessage: ''
        };
    }

    /**
     * Handelt formulier submit af
     */
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Voorkom standaard formulier submit

        // Reset alle custom validity meldingen eerst
        Object.values(formFields).forEach(function(field) {
            field.setCustomValidity('');
        });

        // Valideer alle velden en verzamel fouten
        let firstInvalidField = null;
        let errorMessage = '';
        
        // Check alle velden
        for (const [fieldName, field] of Object.entries(formFields)) {
            const value = field.value.trim();
            
            // Check required
            if (!value) {
                const placeholder = field.getAttribute('placeholder') || fieldName;
                errorMessage = `Het veld "${placeholder}" is verplicht.`;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break; // Stop bij eerste fout
            }
            
            // Specifieke validaties
            if (fieldName === 'naam' && value.length < 2) {
                errorMessage = 'Naam moet minimaal 2 karakters bevatten.';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
            
            if (fieldName === 'email' && !validateEmail(value)) {
                // Specifieke meldingen voor verschillende e-mail fouten
                if (value.includes(',')) {
                    errorMessage = 'Een e-mailadres mag geen komma bevatten. Gebruik een punt in plaats van een komma.';
                } else if (!value.includes('@')) {
                    errorMessage = 'Een e-mailadres moet een @ bevatten.';
                } else if (value.split('@').length !== 2) {
                    errorMessage = 'Een e-mailadres mag slechts één @ bevatten.';
                } else if (!value.includes('.')) {
                    errorMessage = 'Een e-mailadres moet een punt bevatten (bijv. .com, .nl).';
                } else {
                    errorMessage = 'Voer een geldig e-mailadres in (bijv. naam@voorbeeld.nl).';
                }
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
            
            if (fieldName === 'telefoon' && !validateTelefoon(value)) {
                errorMessage = 'Voer een geldig telefoonnummer in (minimaal 10 cijfers).';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
            
            if (fieldName === 'kenteken' && !validateKenteken(value)) {
                errorMessage = 'Voer een geldig kenteken in (6-8 letters en cijfers).';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
            
            if (fieldName === 'automerk' && value.length < 2) {
                errorMessage = 'Automerk moet minimaal 2 karakters bevatten.';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
            
            if (fieldName === 'bandenmaat' && !validateBandenmaat(value)) {
                errorMessage = 'Voer een geldig bandenmaat formaat in (bijv. 205/55 R16).';
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
                break;
            }
        }

        // Als er een ongeldig veld is, toon melding en focus
        if (firstInvalidField && errorMessage) {
            // Focus op het ongeldige veld
            firstInvalidField.focus();
            
            // Zet custom validity voor browser tooltip
            firstInvalidField.setCustomValidity(errorMessage);
            
            // Toon melding in form message element - DIRECT en ZEKER
            console.log('Toon error melding:', errorMessage); // Debug log
            showMessage(errorMessage, 'error');
            
            // Toon ook browser tooltip
            setTimeout(function() {
                if (firstInvalidField) {
                    firstInvalidField.reportValidity();
                }
            }, 50);
            
            return;
        }

        // Valideer het formulier nogmaals (extra check)
        const validation = validateForm();

        if (!validation.isValid) {
            // Toon foutmelding
            console.log('Toon validation error:', validation.errorMessage); // Debug log
            showMessage(validation.errorMessage, 'error');
            // Focus op het eerste ongeldige veld
            for (const [fieldName, field] of Object.entries(formFields)) {
                if (!field.value.trim() || 
                    (fieldName === 'naam' && field.value.trim().length < 2) ||
                    (fieldName === 'email' && !validateEmail(field.value.trim())) ||
                    (fieldName === 'telefoon' && !validateTelefoon(field.value.trim())) ||
                    (fieldName === 'kenteken' && !validateKenteken(field.value.trim())) ||
                    (fieldName === 'automerk' && field.value.trim().length < 2) ||
                    (fieldName === 'bandenmaat' && !validateBandenmaat(field.value.trim()))) {
                    field.focus();
                    break;
                }
            }
            return;
        }

        // Formulier is geldig - sla offerte op
        const offerteData = {
            naam: formFields.naam.value.trim(),
            telefoon: formFields.telefoon.value.trim(),
            email: formFields.email.value.trim(),
            kenteken: formFields.kenteken.value.trim(),
            automerk: formFields.automerk ? formFields.automerk.value.trim() : '',
            bandenmaat: formFields.bandenmaat ? formFields.bandenmaat.value.trim() : ''
        };
        
        // Sla op in localStorage (admin panel)
        let offerteId;
        if (typeof saveOfferte === 'function') {
            const savedOfferte = saveOfferte(offerteData);
            offerteId = savedOfferte.id;
        } else {
            // Fallback: probeer admin.js functie te gebruiken
            try {
                const offertes = JSON.parse(localStorage.getItem('bandendepot_offertes') || '[]');
                offerteData.id = Date.now().toString();
                offerteData.date = new Date().toISOString();
                offerteData.status = 'new';
                offertes.unshift(offerteData);
                localStorage.setItem('bandendepot_offertes', JSON.stringify(offertes));
                offerteId = offerteData.id;
            } catch (e) {
                console.error('Kon offerte niet opslaan:', e);
            }
        }
        
        // Trigger notificatie voor nieuwe offerte
        if (offerteId) {
            triggerNewOfferteNotification(offerteData);
        }
        
        // Toon succesbericht
        showMessage('Bedankt! We hebben je aanvraag ontvangen. We nemen zo spoedig mogelijk contact met je op.', 'success');
        
        // Reset het formulier na succes
        form.reset();
    });

    // Automatisch automerk ophalen op basis van kenteken
    if (formFields.kenteken && formFields.automerk) {
        let kentekenTimeout;
        
        formFields.kenteken.addEventListener('input', function() {
            const kenteken = this.value.trim();
            
            // Clear timeout als gebruiker nog aan het typen is
            clearTimeout(kentekenTimeout);
            
            // Wacht 800ms na laatste input voordat we het automerk ophalen
            if (kenteken.length >= 6) {
                kentekenTimeout = setTimeout(function() {
                    console.log('Kenteken ingevuld, automerk ophalen voor:', kenteken);
                    fetchAutomerkByKenteken(kenteken);
                }, 800);
            } else if (kenteken.length === 0) {
                // Leeg automerk veld als kenteken wordt gewist
                formFields.automerk.value = '';
                formFields.automerk.placeholder = 'Automerk';
            }
        });
        
        // Ook bij blur event (als gebruiker veld verlaat)
        formFields.kenteken.addEventListener('blur', function() {
            const kenteken = this.value.trim();
            if (kenteken.length >= 6 && !formFields.automerk.value.trim()) {
                console.log('Kenteken veld verlaten, automerk ophalen voor:', kenteken);
                fetchAutomerkByKenteken(kenteken);
            }
        });
    } else {
        console.log('Kenteken of automerk veld niet gevonden:', {
            kenteken: !!formFields.kenteken,
            automerk: !!formFields.automerk
        });
    }

    // Controleer of alle velden bestaan voordat we event listeners toevoegen
    if (!form || !formMessage) {
        console.error('Formulier of form message element niet gevonden');
        return;
    }
    
    // Controleer of alle formuliervelden bestaan
    const missingFields = Object.entries(formFields).filter(([name, field]) => !field);
    if (missingFields.length > 0) {
        console.error('Ontbrekende formuliervelden:', missingFields.map(([name]) => name));
        return;
    }

    // Voeg real-time validatie toe aan individuele velden met Nederlandse meldingen
    // Overschrijf HTML5 native validatie met Nederlandse meldingen
    formFields.naam.addEventListener('invalid', function(e) {
        const naamValue = this.value.trim();
        if (!naamValue) {
            this.setCustomValidity('Het veld "Naam" is verplicht.');
        } else if (naamValue.length < 2) {
            this.setCustomValidity('Naam moet minimaal 2 karakters bevatten.');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.telefoon.addEventListener('invalid', function(e) {
        if (!this.value.trim()) {
            this.setCustomValidity('Het veld "Telefoon" is verplicht.');
        } else if (!validateTelefoon(this.value.trim())) {
            this.setCustomValidity('Voer een geldig telefoonnummer in (minimaal 10 cijfers).');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.email.addEventListener('invalid', function(e) {
        if (!this.value.trim()) {
            this.setCustomValidity('Het veld "E-mail" is verplicht.');
        } else if (!validateEmail(this.value.trim())) {
            // Specifieke meldingen voor verschillende e-mail fouten
            const emailValue = this.value.trim();
            if (emailValue.includes(',')) {
                this.setCustomValidity('Een e-mailadres mag geen komma bevatten. Gebruik een punt in plaats van een komma.');
            } else if (!emailValue.includes('@')) {
                this.setCustomValidity('Een e-mailadres moet een @ bevatten.');
            } else if (emailValue.split('@').length !== 2) {
                this.setCustomValidity('Een e-mailadres mag slechts één @ bevatten.');
            } else if (!emailValue.includes('.')) {
                this.setCustomValidity('Een e-mailadres moet een punt bevatten (bijv. .com, .nl).');
            } else {
                this.setCustomValidity('Voer een geldig e-mailadres in (bijv. naam@voorbeeld.nl).');
            }
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.kenteken.addEventListener('invalid', function(e) {
        if (!this.value.trim()) {
            this.setCustomValidity('Het veld "Kenteken" is verplicht.');
        } else if (!validateKenteken(this.value.trim())) {
            this.setCustomValidity('Voer een geldig kenteken in (6-8 letters en cijfers).');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.automerk.addEventListener('invalid', function(e) {
        const automerkValue = this.value.trim();
        if (!automerkValue) {
            this.setCustomValidity('Het veld "Automerk" is verplicht.');
        } else if (automerkValue.length < 2) {
            this.setCustomValidity('Automerk moet minimaal 2 karakters bevatten.');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.bandenmaat.addEventListener('invalid', function(e) {
        if (!this.value.trim()) {
            this.setCustomValidity('Het veld "Bandenmaat" is verplicht.');
        } else if (!validateBandenmaat(this.value.trim())) {
            this.setCustomValidity('Voer een geldig bandenmaat formaat in (bijv. 205/55 R16).');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Real-time validatie bij input (om custom validity te resetten)
    formFields.naam.addEventListener('input', function() {
        const naamValue = this.value.trim();
        if (naamValue && naamValue.length >= 2) {
            this.setCustomValidity('');
        } else if (naamValue && naamValue.length < 2) {
            // Alleen melding geven bij blur, niet tijdens typen
            this.setCustomValidity('');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.telefoon.addEventListener('input', function() {
        const telefoonValue = this.value.trim();
        if (telefoonValue) {
            if (validateTelefoon(telefoonValue)) {
                this.setCustomValidity('');
            } else {
                // Alleen melding geven bij blur, niet tijdens typen
                this.setCustomValidity('');
            }
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.email.addEventListener('input', function() {
        const emailValue = this.value.trim();
        if (emailValue) {
            // Check specifiek op komma fout
            if (emailValue.includes(',')) {
                this.setCustomValidity('Een e-mailadres mag geen komma bevatten. Gebruik een punt in plaats van een komma.');
            } else if (validateEmail(emailValue)) {
                this.setCustomValidity('');
            } else {
                // Alleen melding geven bij blur, niet tijdens typen
                this.setCustomValidity('');
            }
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.kenteken.addEventListener('input', function() {
        const kentekenValue = this.value.trim();
        if (kentekenValue) {
            if (validateKenteken(kentekenValue)) {
                this.setCustomValidity('');
            } else {
                // Alleen melding geven bij blur, niet tijdens typen
                this.setCustomValidity('');
            }
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.automerk.addEventListener('input', function() {
        const automerkValue = this.value.trim();
        if (automerkValue && automerkValue.length >= 2) {
            this.setCustomValidity('');
        } else if (automerkValue && automerkValue.length < 2) {
            // Alleen melding geven bij blur, niet tijdens typen
            this.setCustomValidity('');
        } else {
            this.setCustomValidity('');
        }
    });
    
    formFields.bandenmaat.addEventListener('input', function() {
        const bandenmaatValue = this.value.trim();
        if (bandenmaatValue) {
            if (validateBandenmaat(bandenmaatValue)) {
                this.setCustomValidity('');
            } else {
                // Alleen melding geven bij blur, niet tijdens typen
                this.setCustomValidity('');
            }
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Blur event voor alle velden (voor real-time validatie feedback)
    formFields.telefoon.addEventListener('blur', function() {
        const telefoonValue = this.value.trim();
        if (telefoonValue && !validateTelefoon(telefoonValue)) {
            this.setCustomValidity('Voer een geldig telefoonnummer in (minimaal 10 cijfers).');
            this.reportValidity();
        } else if (telefoonValue) {
            this.setCustomValidity('');
        }
    });
    
    formFields.email.addEventListener('blur', function() {
        const emailValue = this.value.trim();
        if (emailValue && !validateEmail(emailValue)) {
            // Specifieke meldingen voor verschillende e-mail fouten
            if (emailValue.includes(',')) {
                this.setCustomValidity('Een e-mailadres mag geen komma bevatten. Gebruik een punt in plaats van een komma.');
            } else if (!emailValue.includes('@')) {
                this.setCustomValidity('Een e-mailadres moet een @ bevatten.');
            } else if (emailValue.split('@').length !== 2) {
                this.setCustomValidity('Een e-mailadres mag slechts één @ bevatten.');
            } else if (!emailValue.includes('.')) {
                this.setCustomValidity('Een e-mailadres moet een punt bevatten (bijv. .com, .nl).');
            } else {
                this.setCustomValidity('Voer een geldig e-mailadres in (bijv. naam@voorbeeld.nl).');
            }
            this.reportValidity();
        } else if (emailValue) {
            this.setCustomValidity('');
        }
    });
    
    formFields.kenteken.addEventListener('blur', function() {
        const kentekenValue = this.value.trim();
        if (kentekenValue && !validateKenteken(kentekenValue)) {
            this.setCustomValidity('Voer een geldig kenteken in (6-8 letters en cijfers).');
            this.reportValidity();
        } else if (kentekenValue) {
            this.setCustomValidity('');
        }
    });
    
    formFields.bandenmaat.addEventListener('blur', function() {
        const bandenmaatValue = this.value.trim();
        if (bandenmaatValue && !validateBandenmaat(bandenmaatValue)) {
            this.setCustomValidity('Voer een geldig bandenmaat formaat in (bijv. 205/55 R16).');
            this.reportValidity();
        } else if (bandenmaatValue) {
            this.setCustomValidity('');
        }
    });
    
    // Blur event voor naam en automerk (voor validatie feedback)
    formFields.naam.addEventListener('blur', function() {
        const naamValue = this.value.trim();
        if (naamValue && naamValue.length < 2) {
            this.setCustomValidity('Naam moet minimaal 2 karakters bevatten.');
            this.reportValidity();
        } else if (naamValue) {
            this.setCustomValidity('');
        }
    });
    
    formFields.automerk.addEventListener('blur', function() {
        const automerkValue = this.value.trim();
        if (automerkValue && automerkValue.length < 2) {
            this.setCustomValidity('Automerk moet minimaal 2 karakters bevatten.');
            this.reportValidity();
        } else if (automerkValue) {
            this.setCustomValidity('');
        }
    });

    // Header CTA knop - alleen op homepage naar formulier scrollen (als het een link is)
    const headerCTA = document.querySelector('.header-cta');
    if (headerCTA && headerCTA.getAttribute('href') && headerCTA.getAttribute('href').startsWith('#')) {
        headerCTA.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const formElement = document.getElementById(href.substring(1));
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(function() {
                        if (formFields.naam) {
                            formFields.naam.focus();
                        }
                    }, 500);
                }
            }
        });
    }
});

/**
 * Trigger notificatie voor nieuwe offerte
 * @param {object} offerteData - De offerte data
 */
function triggerNewOfferteNotification(offerteData) {
    // Trigger custom event voor admin panel
    const event = new CustomEvent('newOfferte', {
        detail: offerteData
    });
    window.dispatchEvent(event);
    
    // Browser notification (als toegestaan)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nieuwe Offerte Aanvraag', {
            body: `Nieuwe offerte van ${offerteData.naam} (${offerteData.kenteken})`,
            icon: 'images/bdepot2.png',
            tag: 'new-offerte',
            requireInteraction: false
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        // Vraag toestemming voor notificaties
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                new Notification('Nieuwe Offerte Aanvraag', {
                    body: `Nieuwe offerte van ${offerteData.naam} (${offerteData.kenteken})`,
                    icon: 'images/bdepot2.png',
                    tag: 'new-offerte'
                });
            }
        });
    }
    
    // Log voor debugging
    console.log('Nieuwe offerte ontvangen:', offerteData);
    
    // Stuur e-mail notificatie naar admin
    sendEmailNotification(offerteData);
}

/**
 * Stuur e-mail notificatie via backend API of EmailJS
 * @param {object} offerteData - De offerte data
 */
function sendEmailNotification(offerteData) {
    // Voeg datum toe aan offerte data
    const emailData = {
        ...offerteData,
        date: new Date().toISOString()
    };
    
    console.log('Verzenden e-mail notificatie...', emailData);
    
    // OPTIE 1: Probeer eerst PHP backend (alleen als niet lokaal)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
    
    if (!isLocalhost) {
        fetch('send-email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('✅ E-mail notificatie verzonden via PHP:', data);
            } else {
                console.error('❌ Fout bij verzenden e-mail via PHP:', data.error);
                console.log('PHP mail() werkt niet, e-mail notificatie overgeslagen');
            }
        })
        .catch(error => {
            console.warn('⚠️ PHP backend niet beschikbaar:', error.message);
            console.log('E-mail notificatie overgeslagen. Upload send-email.php naar server of gebruik EmailJS.');
        });
    } else {
        console.log('Lokaal testen - PHP backend overgeslagen. Upload naar server voor e-mail functionaliteit.');
    }
}

/**
 * Stuur e-mail via EmailJS (client-side, geen server nodig)
 * SETUP: Zie EMAIL_SETUP.md voor instructies
 * @param {object} offerteData - De offerte data
 */
function sendEmailViaEmailJS(offerteData) {
    // Check of EmailJS is geladen
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS niet geladen - e-mail notificatie overgeslagen');
        return;
    }
    
    // EmailJS configuratie - VERVANG MET JOUW EIGEN WAARDEN
    // Zie: https://www.emailjs.com/docs/
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Vervang met jouw EmailJS Service ID
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Vervang met jouw EmailJS Template ID
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Vervang met jouw EmailJS Public Key
    
    // Initialiseer EmailJS (alleen eerste keer)
    if (!window.emailjsInitialized) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        window.emailjsInitialized = true;
    }
    
    // Template parameters
    const templateParams = {
        to_email: 'k.gogal36@gmail.com',
        from_name: offerteData.naam,
        from_email: offerteData.email,
        subject: 'Nieuwe Offerte Aanvraag - Bandendepot',
        naam: offerteData.naam,
        telefoon: offerteData.telefoon,
        email: offerteData.email,
        kenteken: offerteData.kenteken,
        automerk: offerteData.automerk || 'Niet opgegeven',
        bandenmaat: offerteData.bandenmaat || 'Niet opgegeven',
        datum: new Date().toLocaleString('nl-NL')
    };
    
    // Verstuur e-mail
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('✅ E-mail verzonden via EmailJS:', response.status, response.text);
        }, function(error) {
            console.error('❌ Fout bij verzenden via EmailJS:', error);
        });
}

// Apply logo settings from CMS editor
function applyLogoSettings() {
    const logoSettings = JSON.parse(localStorage.getItem('cms_logo_settings') || '{}');
    const settings = JSON.parse(localStorage.getItem('cms_settings') || '{}');
    
    const logoHeight = settings.logoHeight || logoSettings.height;
    const logoPosition = settings.logoPosition !== undefined ? settings.logoPosition : 0;
    const logoPositionMobile = settings.logoPositionMobile !== undefined ? settings.logoPositionMobile : 0;
    
    // Apply logo size
    if (logoHeight) {
        const styleId = 'cms-logo-size-style';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        // Header stays fixed height, logo can grow up to 200px
        const heightNum = parseInt(logoHeight);
        const logoMaxHeight = Math.min(heightNum, 200); // Logo max height is 200px
        
        styleElement.textContent = `
            .header {
                padding: 0.75rem 0 !important;
                height: 80px !important;
                min-height: 80px !important;
                max-height: 80px !important;
            }
            .header-container {
                align-items: center !important;
                height: 60px !important;
                min-height: 60px !important;
                max-height: 60px !important;
                overflow: visible !important;
                justify-content: flex-start !important;
            }
            .logo-container {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                height: 60px !important;
                max-height: 60px !important;
                overflow: visible !important;
            }
            .logo {
                height: ${logoMaxHeight}px !important;
                width: auto !important;
                max-height: 200px !important;
                object-fit: contain !important;
                display: block !important;
            }
            .main-nav {
                align-items: center !important;
                flex: 1 !important;
                justify-content: center !important;
                height: 60px !important;
            }
            .header-cta {
                align-self: center !important;
                flex-shrink: 0 !important;
                height: auto !important;
            }
        `;
    }
    
    // Apply logo position separately - ALWAYS apply, even if no logoHeight
    const positionStyleId = 'cms-logo-position-style';
    let positionStyleElement = document.getElementById(positionStyleId);
    
    if (!positionStyleElement) {
        positionStyleElement = document.createElement('style');
        positionStyleElement.id = positionStyleId;
        document.head.appendChild(positionStyleElement);
    }
    
    // Calculate position - use pixel-based margin-left
    // Negative values move logo more to the left, positive to the right
    const marginLeft = logoPosition + 'px';
    
    // Apply with high specificity to override any other CSS
    // Remove padding-left from header-container for corner positioning
    positionStyleElement.textContent = `
        .header-container {
            justify-content: flex-start !important;
            padding-left: 0 !important;
        }
        .logo-container {
            margin-left: ${marginLeft} !important;
            margin-right: auto !important;
            transform: none !important;
            position: relative !important;
        }
        header .header-container .logo-container {
            margin-left: ${marginLeft} !important;
        }
        .header .header-container .logo-container {
            margin-left: ${marginLeft} !important;
        }
    `;
    
    // Also directly apply to element if it exists (for immediate effect)
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.style.marginLeft = marginLeft;
        logoContainer.style.marginRight = 'auto';
    }
    
    // Apply logo position (Mobile)
    const positionMobileStyleId = 'cms-logo-position-mobile-style';
    let positionMobileStyleElement = document.getElementById(positionMobileStyleId);
    
    if (!positionMobileStyleElement) {
        positionMobileStyleElement = document.createElement('style');
        positionMobileStyleElement.id = positionMobileStyleId;
        document.head.appendChild(positionMobileStyleElement);
    }
    
    const marginLeftMobile = logoPositionMobile + 'px';
    
    positionMobileStyleElement.textContent = `
        @media (max-width: 768px) {
            .logo-container {
                margin-left: ${marginLeftMobile} !important;
                margin-right: 0 !important;
                transform: none !important;
            }
            header .header-container .logo-container {
                margin-left: ${marginLeftMobile} !important;
            }
            .header .header-container .logo-container {
                margin-left: ${marginLeftMobile} !important;
            }
        }
    `;
    
    // Apply logo URL
    if (logoSettings.url || settings.logoUrl) {
        const logoUrl = settings.logoUrl || logoSettings.url;
        const logoImg = document.querySelector('.logo');
        if (logoImg) {
            logoImg.src = logoUrl;
        }
    }
}

// Load CMS components for current page
function loadCMSComponents() {
    try {
        // Get current page name - try multiple methods
        let currentPage = window.location.pathname;
        if (!currentPage || currentPage === '/') {
            currentPage = 'index.html';
        } else {
            currentPage = currentPage.split('/').pop() || 'index.html';
        }
        
        let pageKey = 'home';
        
        // Determine page key
        if (currentPage.includes('assortiment') || currentPage === 'assortiment.html') {
            pageKey = 'assortiment';
        } else if (currentPage.includes('montage') || currentPage === 'montage.html') {
            pageKey = 'montage';
        } else if (currentPage.includes('over-ons') || currentPage === 'over-ons.html') {
            pageKey = 'over-ons';
        } else {
            pageKey = 'home'; // Default to home for index.html or empty
        }
        
        const storageKey = 'cms_content_' + pageKey;
        console.log('🔍 Loading CMS components');
        console.log('  Current page:', currentPage);
        console.log('  Page key:', pageKey);
        console.log('  Storage key:', storageKey);
        
        // Load saved components
        const saved = localStorage.getItem(storageKey);
        console.log('  Saved content exists:', !!saved);
        
        if (saved && saved.trim() !== '') {
            console.log('  Content preview:', saved.substring(0, 200));
            
            // Check if it's valid component content (not iframe)
            if (saved.includes('<iframe') || saved.includes('page-preview-container')) {
                console.log('  ❌ Content is iframe/preview, skipping');
                return;
            }
            
            // Extract only the content from editable elements (remove edit/delete handles)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = saved;
            
            const editableElements = tempDiv.querySelectorAll('.editable-element');
            console.log('  Found editable elements:', editableElements.length);
            
            if (editableElements.length > 0) {
                // Wait for main content to be available
                const mainContent = document.querySelector('.main-content') || document.querySelector('main');
                if (!mainContent) {
                    console.log('  ⏳ Main content not found yet, retrying in 500ms...');
                    setTimeout(loadCMSComponents, 500);
                    return;
                }
                
                // Create or get container for CMS components
                let cmsContainer = document.getElementById('cms-components-container');
                if (!cmsContainer) {
                    cmsContainer = document.createElement('div');
                    cmsContainer.id = 'cms-components-container';
                    cmsContainer.style.cssText = 'max-width: 1400px; margin: 0 auto; padding: 2rem; background-color: #ffffff;';
                    
                    // Insert at the beginning of main content
                    mainContent.insertBefore(cmsContainer, mainContent.firstChild);
                    console.log('  ✅ CMS container created and inserted');
                }
                
                // Clear and add components
                cmsContainer.innerHTML = '';
                editableElements.forEach((element, index) => {
                    // Clone the element and remove edit/delete handles
                    const clone = element.cloneNode(true);
                    const handles = clone.querySelectorAll('.edit-handle, .delete-handle');
                    handles.forEach(handle => handle.remove());
                    
                    // Remove editable-element class and reset styles
                    clone.classList.remove('editable-element');
                    clone.style.border = 'none';
                    clone.style.padding = '0';
                    clone.style.margin = '0';
                    clone.style.position = 'static';
                    
                    // Remove contenteditable attributes for production
                    clone.querySelectorAll('[contenteditable="true"]').forEach(el => {
                        el.removeAttribute('contenteditable');
                    });
                    
                    // Extract inner content if needed
                    const innerContent = clone.querySelector('.element-heading, .element-text, .element-button, .element-image, .element-section');
                    if (innerContent) {
                        // Keep the inner content
                    }
                    
                    cmsContainer.appendChild(clone);
                    console.log('  ✅ Component', index + 1, 'added');
                });
                
                console.log('  ✅ All components loaded successfully!');
            } else {
                console.log('  ⚠️ No editable elements found in saved content');
            }
        } else {
            console.log('  ℹ️ No saved content found for this page');
            // Check all possible keys for debugging
            console.log('  Available CMS keys:', Object.keys(localStorage).filter(k => k.startsWith('cms_content_')));
        }
    } catch (error) {
        console.error('  ❌ Error loading CMS components:', error);
    }
}

// Test function to check if components are saved
function testCMSComponents() {
    console.log('🧪 Testing CMS Components...');
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cms_content_'));
    console.log('Found CMS keys:', keys);
    keys.forEach(key => {
        const content = localStorage.getItem(key);
        console.log(`  ${key}:`, content ? content.substring(0, 100) + '...' : 'empty');
    });
}

// Listen for logo size changes and apply immediately
window.addEventListener('logoSizeChanged', function(event) {
    const height = event.detail.height;
    applyLogoSettings(); // Re-apply with new height
});

window.addEventListener('logoPositionChanged', function(event) {
    // Immediately apply the new position
    const position = event.detail.position;
    const marginLeft = position + 'px';
    
    // Apply via style element
    const positionStyleId = 'cms-logo-position-style';
    let positionStyleElement = document.getElementById(positionStyleId);
    
    if (!positionStyleElement) {
        positionStyleElement = document.createElement('style');
        positionStyleElement.id = positionStyleId;
        document.head.appendChild(positionStyleElement);
    }
    
    positionStyleElement.textContent = `
        .header-container {
            justify-content: flex-start !important;
            padding-left: 0 !important;
        }
        .logo-container {
            margin-left: ${marginLeft} !important;
            margin-right: auto !important;
            transform: none !important;
        }
        header .header-container .logo-container {
            margin-left: ${marginLeft} !important;
        }
        .header .header-container .logo-container {
            margin-left: ${marginLeft} !important;
        }
    `;
    
    // Also directly apply to element for immediate effect
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.style.marginLeft = marginLeft;
        logoContainer.style.marginRight = 'auto';
    }
    
    // Remove padding from header-container for corner positioning
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
        headerContainer.style.paddingLeft = '0';
    }
    
    // Also call applyLogoSettings to ensure everything is in sync
    applyLogoSettings();
});

// Remove white background from tire image - professional transparent background
function removeWhiteBackgroundFromTire() {
    const tireImage = document.querySelector('.tire-image');
    if (!tireImage) return;
    
    // Wait for image to load first
    if (!tireImage.complete) {
        tireImage.addEventListener('load', function() {
            processTireImage(tireImage);
        });
    } else {
        // Small delay to ensure image is fully loaded
        setTimeout(function() {
            processTireImage(tireImage);
        }, 100);
    }
}

function processTireImage(tireImage) {
    try {
        // Create canvas to process image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Make white and near-white pixels transparent
            // Using improved algorithm for better background removal
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Skip if already transparent
                if (a === 0) continue;
                
                // Calculate brightness
                const brightness = (r + g + b) / 3;
                
                // Calculate color similarity (how neutral/gray the color is)
                const colorSimilarity = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
                
                // More aggressive white background removal
                // Remove pixels that are:
                // 1. Very bright (white/light colors) - threshold lowered to 180
                // 2. Have similar RGB values (neutral colors, not the tire itself)
                const whiteThreshold = 180; // Lower threshold for more aggressive removal
                const similarityThreshold = 40; // Higher threshold to catch more neutral colors
                
                if (brightness > 250) {
                    // Pure white pixels - always remove
                    data[i + 3] = 0;
                } else if (brightness > whiteThreshold && colorSimilarity < similarityThreshold) {
                    // White/light gray pixels with low color variation - remove
                    data[i + 3] = 0;
                } else if (brightness > 200 && colorSimilarity < 25) {
                    // Medium brightness neutral colors - remove
                    data[i + 3] = 0;
                } else if (brightness > 190 && r > 180 && g > 180 && b > 180 && colorSimilarity < 30) {
                    // Light colors that are close to white - remove
                    data[i + 3] = 0;
                }
            }
            
            // Put processed image data back
            ctx.putImageData(imageData, 0, 0);
            
            // Replace image source with processed canvas
            const processedDataUrl = canvas.toDataURL('image/png');
            tireImage.src = processedDataUrl;
            
            // Ensure image maintains transparency
            tireImage.style.background = 'transparent';
            tireImage.style.backgroundColor = 'transparent';
            
            console.log('✅ Tire image background removed successfully');
        };
        
        img.onerror = function() {
            console.log('Could not process tire image - using CSS fallback');
            // CSS fallback - try to hide white background
            tireImage.style.mixBlendMode = 'multiply';
            tireImage.style.filter = 'contrast(1.2) brightness(0.95)';
        };
        
        // Use the current image source
        img.src = tireImage.src;
        
        // Handle CORS issues
        if (tireImage.src.indexOf('data:') !== 0) {
            img.crossOrigin = 'anonymous';
        }
    } catch (e) {
        console.log('Error processing tire image:', e);
        // If canvas processing fails, use CSS blend mode as fallback
        tireImage.style.mixBlendMode = 'multiply';
        tireImage.style.filter = 'contrast(1.2) brightness(0.95)';
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileCta = document.querySelector('.mobile-cta');

    if (!menuToggle || !mainNav || !overlay) return;

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking mobile CTA
    if (mobileCta) {
        mobileCta.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }
}

// Cookie banner functionaliteit
document.addEventListener('DOMContentLoaded', function() {
    // Apply logo settings first
    applyLogoSettings();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Remove white background from tire image
    removeWhiteBackgroundFromTire();
    
    // Test CMS components on load
    testCMSComponents();
    
    // Load CMS components - with delay to ensure DOM is ready
    setTimeout(function() {
        loadCMSComponents();
    }, 100);
    
    // Also try loading after a longer delay in case page loads slowly
    setTimeout(function() {
        loadCMSComponents();
    }, 1000);
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    
    if (cookieBanner && acceptCookiesBtn) {
        // Check of gebruiker al cookies heeft geaccepteerd
        const cookiesAccepted = localStorage.getItem('cookies_accepted');
        
        if (!cookiesAccepted) {
            // Toon cookie banner na korte delay voor betere UX
            setTimeout(function() {
                cookieBanner.classList.add('show');
            }, 1000);
        }
        
        // Accepteer cookies
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookies_accepted', 'true');
            cookieBanner.classList.remove('show');
            
            // Verwijder banner na animatie
            setTimeout(function() {
                cookieBanner.style.display = 'none';
            }, 400);
        });
    }
    
    // Listen for logo size changes from CMS editor
    window.addEventListener('logoSizeChanged', function(e) {
        applyLogoSettings();
    });
    
    // Listen for logo position changes from CMS editor (Desktop)
    window.addEventListener('logoPositionChanged', function(e) {
        applyLogoSettings();
    });
    
    // Listen for logo position changes from CMS editor (Mobile)
    window.addEventListener('logoPositionMobileChanged', function(e) {
        applyLogoSettings();
    });
});


