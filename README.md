# RBI Statistics on Indian States 2024-25

An interactive dashboard visualization of the Reserve Bank of India's "Handbook of Statistics on Indian States, 2024-25". This project transforms static statistical data into an engaging, explorable web application.

## Features

*   **Interactive India Map**: Visualize state-wise GDP distribution with an interactive choropleth map.
*   **Sectoral Deep Dives**: Detailed analytics for key sectors:
    *   **State GDP**: Gross State Domestic Product and growth trends.
    *   **Banking**: Branch distribution, deposit, and credit data.
    *   **Exports**: State contribution to national exports.
    *   **Tourism**: Domestic and foreign tourist arrival statistics.
*   **Comparison Tool**: Compare economic indicators between different states.
*   **Responsive Design**: Premium, glassmorphism-inspired UI that works seamlessly across devices.

## Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Maps**: [react-simple-maps](https://www.react-simple-maps.io/)
*   **Icons**: [Heroicons](https://heroicons.com/)
*   **Font**: Fraunces (Display) & Source Sans 3 (Body)

## Getting Started

### Prerequisites

*   Node.js 18+ installed

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/roshanis/rbi2024-2025.git
    cd rbi2024-2025
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Data Source

All data is sourced from the [RBI Handbook of Statistics on Indian States, 2024-25](https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook%20of%20Statistics%20on%20Indian%20States).

## License

This project is open source and available under the [MIT License](LICENSE).
