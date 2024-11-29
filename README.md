# AR-enhanced BIM for Facility Management: Felipe Moreira's BIM A+ European Master Thesis

## Overview
This project implements an Augmented Reality (AR)-enhanced collaborative environment for Facility Management (FM), supported by OpenBIM principles. The application uses WebXR, Three.js, and IFC.js to create a web-based, open-source AR platform designed to integrate BIM (Building Information Modelling) data into AR environments. It facilitates real-time access to BIM data, enabling productivity gains, better decision-making, and reduced errors during facility management operations.

This repository contains the source code, developed as part of a Master's dissertation at Universidade do Minho, for a tool that leverages AR to enhance collaboration in construction and FM. The project emphasizes cost-effective, open-source development, reducing reliance on proprietary tools like Unity3D or Unreal Engine.

## Features
- **Web-Based AR Platform:** Accessible through modern web browsers on mobile devices, tablets, HMDs, and smart glasses.
- **Integration of IFC Models:** Ensures interoperability with BIM tools without data loss.
- **Dynamic Data Access:** Interact with 3D models and retrieve real-time metadata in an AR environment.
- **Marker-Based Tracking:** Uses image markers for aligning AR objects in real-world spaces.
- **Open-Source Framework:** Built entirely on open standards like WebXR and Industry Foundation Classes (IFC).

## Key Technologies
- **Three.js:** For rendering 3D scenes and managing AR interactions.
- **WebXR:** Enables immersive AR experiences directly in browsers.
- **IFC.js:** For parsing and displaying BIM models in the application.

## Project Objectives
- Provide a user-friendly AR application for managing facilities and visualizing BIM data.
- Promote open formats for FM by integrating BIM data directly without third-party plugins.
- Enable real-time data-driven decision-making for facility managers.
- Foster collaboration and community-driven development in the construction industry.

## Setup Instructions
1. Clone the Repository:
```js
git clone https://github.com/Felipemore96/BIM-A-Dissertation.git
cd BIM-A-Dissertation
```
2. Install Dependencies: Ensure Node.js is installed, then run:

```
npm install
```
3. Run the Development Server: Start the application on a local server:

```
npm start
```

4. Access the Application: Open your browser and navigate to the URL displayed in the terminal (default: https://localhost:8080).

## Usage
1. Upload BIM models in IFC format.
2. Place AR markers (e.g., QR codes) in the physical environment to align 3D objects.
3. Interact with models in the AR scene, viewing metadata and exploring geometries.
4. Use supported devices for immersive experiences (smartphones, HMDs, etc.).

## Case Study
The application was tested using a BIM model derived from a laser-scanned office environment at EQS Global. The case study validated:

1. Model compatibility with the AR environment.
2. Real-time data access and interaction.
3. Marker-based tracking and object alignment.

## Future Work
- User Experience Optimization: Improve interface responsiveness and ease of use.
- Advanced Features: Implement IoT integrations and dynamic data updates.
- Evolving AR Standards: Adapt the platform to emerging AR devices and WebXR advancements.

## License
This project is licensed under CC BY 4.0. See LICENSE for details.

## Acknowledgments
Special thanks to my advisors, Professor Miguel Azenha and José Ferrão, and the BIM A+ Master Programme for their invaluable guidance and support.

For more details, refer to the full thesis document available in the repository.
