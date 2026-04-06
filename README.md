# Water Tracker

Water Tracker is a simple and mobile-friendly hydration app that helps users track their daily water intake, stay consistent with their hydration goals, and view their progress throughout the day. The app is designed to feel clean, convenient, and easy to use, especially on a phone.

## Overview

The purpose of Water Tracker is to give users a quick and simple way to log how much water they have drank during the day without dealing with clutter or unnecessary complexity. Users can set a daily water goal, add to their intake as they drink throughout the day, and see their progress update visually.

The app is built with a phone-app style experience in mind and is designed to work well as a lightweight web app.

## Features

- Set a custom daily water goal in ounces
- Track current daily water intake
- Add water throughout the day with quick updates
- View progress as a percentage of the daily goal
- Visual progress bar for hydration progress
- Daily reset system so tracking starts fresh each day
- Mobile-friendly layout
- App-style experience when added to a home screen
- Uses local storage so data stays saved on the device

## Technologies Used

- **HTML**
- **CSS**
- **JavaScript**
- **Local Storage**
- **Progressive Web App (PWA) features**

## How It Works

The app allows users to set a hydration goal and log water intake throughout the day.

General flow:

1. User opens the app
2. User sets a daily water goal in ounces
3. User adds water as they drink throughout the day
4. The app updates the total water consumed
5. The progress bar and percentage update automatically
6. The app resets daily so the user can begin again the next day

## Data Storage

Water Tracker uses the browser's local storage to save data on the device.

Example stored values include:

- `water_oz` – current water consumed
- `water_goal` – daily hydration goal
- `water_expiry` – reset timing for daily refresh

This allows the app to preserve progress even if the page is refreshed or reopened later.

## Daily Reset Logic

The app includes a daily reset system so users start fresh each day.

Instead of keeping the same total forever, the app stores an expiration/reset time and clears the daily intake when that time is reached. In this version of the project, the reset is based on **5:00 AM Central Time**, which helps separate late-night use from the next full day of tracking.

## Mobile Experience

This project is designed to feel more like a phone app than a traditional desktop webpage.

Features supporting that experience include:

- clean mobile layout
- touch-friendly design
- home screen app support
- app icons and manifest configuration
- lightweight and fast interaction
