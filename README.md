# Logger-Pi

Logger-Pi is a lightweight, central logging service designed for Raspberry Pi environments.

## Overview

This service acts as the primary ingestion point for logs from other modules in the "Pi" ecosystem. It provides a simple API to receive logs and can optionally organize them or trigger actions based on log content.

## Key Features

- **Centralized Ingestion**: Accepts logs via HTTP from various microservices.
- **Pi-Optimized**: Minimal resource footprint, suitable for 24/7 background operation.
- **Log Rotation/Management**: Basic management of incoming log streams.

## Getting Started

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start the service: `npm start`
