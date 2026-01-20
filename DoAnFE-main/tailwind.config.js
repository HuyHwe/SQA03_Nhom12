module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
			fontWeight: {
        'extra-light': 200,
        'semi-bold': 600,
        // Add more custom font weights as needed
      },
			fontSize: {
				'12': '12px',
        '14': '14px',
        '18': '18px',
        '24': '24px',
        // Add more custom font sizes as needed
      },
			lineHeight: {
        '20': '20px',
        '18': '18px',
        '5': '1.25rem',
        // Add more custom line heights as needed
      },
      colors: {
				blurblack:"rgba(0, 0, 0, 0.3)",
				custom: '#FEF1EA',
				green_1:"#00CA15",
				green_2:"#E6FAE8",
				blueprimary	:"#00b14f",
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a"}
      }
    },
    fontFamily: {
      'body': [
    'Inter', 
    'ui-sans-serif', 
    'system-ui', 
    '-apple-system', 
    'system-ui', 
    'Segoe UI', 
    'Roboto', 
    'Helvetica Neue', 
    'Arial', 
    'Noto Sans', 
    'sans-serif', 
    'Apple Color Emoji', 
    'Segoe UI Emoji', 
    'Segoe UI Symbol', 
    'Noto Color Emoji'
  ],
      'sans': [
    'Inter', 
    'ui-sans-serif', 
    'system-ui', 
    '-apple-system', 
    'system-ui', 
    'Segoe UI', 
    'Roboto', 
    'Helvetica Neue', 
    'Arial', 
    'Noto Sans', 
    'sans-serif', 
    'Apple Color Emoji', 
    'Segoe UI Emoji', 
    'Segoe UI Symbol', 
    'Noto Color Emoji'
  ]
    }
  }
}