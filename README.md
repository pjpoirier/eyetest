# Windows RGB Contrast Finder

A web-based accessibility tool designed to help users with various eye conditions find optimal text and background color combinations for Windows systems.

## 🎯 About

Windows RGB Contrast Finder is an interactive tool that lets you explore and test color contrast ratios tailored to specific eye conditions. Whether you have low vision, color blindness, light sensitivity, or other vision challenges, this tool helps you find accessible color combinations and apply them to Windows Accessibility settings.

## ✨ Features

- **Eye Condition Presets** - Recommended color combinations for:
  - Low vision conditions (macular degeneration, glaucoma, cataracts, etc.)
  - Color vision deficiencies (protanopia, deuteranopia, tritanopia, achromatopsia)
  - Light sensitivity conditions (photophobia, albinism, retinitis pigmentosa)
  - Other conditions (hemianopia, keratoconus)

- **Live Preview** - See your color combination in real-time
- **WCAG Compliance Checker** - Automatic validation against WCAG 2.1 standards (AA/AAA levels)
- **Color Customization** - Adjust colors via:
  - Hex input
  - RGB sliders
  - Color pickers
- **Windows Integration Guide** - Instructions for applying colors to Windows Accessibility settings
- **Easy Export** - Copy your chosen combination for quick sharing or saving

## 🚀 Getting Started

### Online
Visit the live tool: https://pjpoirier.github.io/eyetest/

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/pjpoirier/eyetest.git
   cd eyetest
   ```

2. Open `index.html` in your browser

No build tools or dependencies required!

## 📖 How to Use

1. **Select Your Eye Condition** - Choose from the dropdown menu
2. **Explore Presets** - Click any preset pill to apply recommended colors
3. **Customize** - Use hex input, color pickers, or RGB sliders to fine-tune
4. **Check Compliance** - See WCAG contrast ratio and compliance levels
5. **Apply to Windows** - Follow the instructions to use your colors in Windows Accessibility settings

## 🏗️ Project Structure

```
eyetest/
├── index.html      # Main HTML with embedded CSS and JavaScript
├── style.css       # Separated stylesheet
├── script.js       # Separated JavaScript
├── README.md       # This file
└── LICENSE         # MIT License
```

## 📚 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and dark mode support
- **Vanilla JavaScript** - No dependencies, lightweight (~2KB)
- **WCAG 2.1** - Contrast ratio calculations per official standards
- **Tabler Icons** - Icon library via CDN

## ♿ Accessibility

This tool is built with accessibility in mind:
- Semantic HTML structure
- ARIA labels for all interactive elements
- Keyboard navigation support
- Dark mode support via system preferences
- High contrast compliance

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or request features via [Issues](https://github.com/pjpoirier/eyetest/issues)
- Submit improvements via Pull Requests
- Suggest additional eye condition presets

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WCAG 2.1 contrast ratio formula: https://www.w3.org/TR/WCAG21/
- Tabler Icons: https://tabler.io/
- Accessibility guidance from vision organizations and research

## 📧 Support

If you have questions or suggestions, please open an [issue](https://github.com/pjpoirier/eyetest/issues) on GitHub.

---

**Built for Windows accessibility** · Made with ❤️ for better digital access
