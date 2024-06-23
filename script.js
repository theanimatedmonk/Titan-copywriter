document.addEventListener('DOMContentLoaded', () => {
    const promptTextarea = document.getElementById('prompt');
    const generateBtn = document.getElementById('generate-btn');
    const riveContainer = document.getElementById('rive-canvas');
    const responseContainer = document.getElementById('response-container');
    const responseText = document.getElementById('response-text');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtnPlusDropdowns = document.getElementById('generate-btn-plus-dropdowns');


    let selectedPurpose = '';
    let selectedStyle = '';
    let selectedLength = '';

    const updateDropdownSelection = (dropdown, value) => {
        if (dropdown === 'dropdownMenuButton') selectedPurpose = value;
        if (dropdown === 'dropdownMenuButtonLanguage') selectedStyle = value;
        if (dropdown === 'dropdownMenuButtonLength') selectedLength = value;
    };

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedOption = e.target.textContent;
            const selectedValue = e.target.getAttribute('data-value');
            const dropdown = e.target.closest('.dropdown');
            dropdown.querySelector('.label').textContent = selectedOption;
            updateDropdownSelection(dropdown.querySelector('.dropdown-toggle').id, selectedValue);
            dropdown.querySelector('.dropdown-menu').classList.remove('show'); // Close dropdown menu
        });
    });

    document.querySelectorAll('.dropdown-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownMenu = button.nextElementSibling;
            dropdownMenu.classList.toggle('show');
            
            // Close other dropdown menus
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Handle generate button click
    generateBtn.addEventListener('click', async () => {
        const userPrompt = promptTextarea.value.trim();
        if (!userPrompt) return;

        // Collapse the text input field
        promptTextarea.style.height = '20px';
        promptTextarea.style.backgroundColor = '#F7F7F7';
        promptTextarea.style.whiteSpace = 'nowrap';
        promptTextarea.style.overflow = 'hidden';
        promptTextarea.style.textOverflow = 'ellipsis';



        // Hide the generate button and dropdowns
        generateBtnPlusDropdowns.classList.add('hidden');

        // Hide the the previous content
        responseContainer.classList.add('hidden');

        // Show the Rive animation after a short delay
        riveContainer.classList.remove('hidden');

        // Setup and play Rive animation
        const r = new rive.Rive({
            src: 'copywriter.riv', // Replace with the actual path to your Rive file
            canvas: document.getElementById('rive-canvas'),
            autoplay: true,
            artboard: 'shimer 4',
            animations: 'iOS'
        });

        // Construct the system prompt
        let systemPrompt = `You are a seasoned copywriter with 20 years of professional experience. 
        You can identify the brand and product tone easily and based on that you provide content. 
        Titan's brand and product tone is professional and user-friendly. 
        Titan's product copy should be very easily understandable to technically immature users and devoid of technical jargon. 
        The grammar and sentence structure should be straightforward. No fancy sentence formation or marketing copy should be there. 
        Maintain professionalism. The copy tends to be less verbose most of the time unless explicitly mentioned.`;

        if (selectedPurpose) systemPrompt += ` Purpose of the copy: ${selectedPurpose}.`;
        if (selectedStyle) systemPrompt += ` Style of the copy: ${selectedStyle}.`;
        if (selectedLength) systemPrompt += ` Length of the copy: ${selectedLength}.`;

        // Call the GPT API
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer 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`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            const data = await response.json();
            const generatedContent = data.choices[0].message.content;

            // Hide the Rive animation
            riveContainer.classList.add('hidden');

            // Show the response container with the generated content
            responseText.textContent = generatedContent;
            responseContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching GPT response:', error);
        }
    });

    // Handle copy button click
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(responseText.textContent).then(() => {
            alert('Text copied to clipboard');
        }).catch(err => {
            console.error('Error copying text: ', err);
        });
    });

    // Handle text input field click to expand and show dropdowns again
    promptTextarea.addEventListener('click', () => {
        promptTextarea.style.height = '100px';
        promptTextarea.style.backgroundColor = '#ffffff';
        promptTextarea.style.whiteSpace = 'normal';
        promptTextarea.style.overflow = 'auto';
        generateBtnPlusDropdowns.classList.remove('hidden');
    });
});
