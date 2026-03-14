# Adherium

This project is an Angular application that visualizes inhaler usage data as a clinical dashboard.
The goal is to help clinicians quickly understand a patient's medication adherence and inhaler technique quality over time.

The dashboard loads sample JSON data representing inhaler events captured by Hailie sensors and transforms it into visual insights that highlight patterns in adherence and technique quality.

---

# Running the Project

### 1. Requirements

Make sure you have the following installed:

- **Node.js**
- **Angular CLI (latest)**

You can verify your versions with:

```bash
node -v
ng version
```

### 2. Clone the repository

```bash
git clone https://github.com/code-joker/adherium.git
cd adherium
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
ng serve -o
```

Then open the application in your browser:

```
http://localhost:4200
```

### Note about Tailwind

In some cases Tailwind styles may not load correctly on the first run after installing dependencies.
If the application appears unstyled or the layout looks broken:

1. Stop the development server.
2. Close the terminal.
3. Open a new terminal window.
4. Run `ng serve` again.

After restarting the dev server, Tailwind should load correctly.

---

# Tech Stack

| Technology              | Purpose                      |
| ----------------------- | ---------------------------- |
| Angular 21              | Frontend framework           |
| ng2-charts (Chart.js)   | Data visualization           |
| Tailwind CSS            | Styling                      |
| Tailwind Plus UI Blocks | Layout and UI structure      |
| TypeScript              | Strongly typed frontend code |

---

# Why These Tools

### ng2-charts / Chart.js

I chose **ng2-charts** because it is a well-maintained Angular wrapper around Chart.js and I was already familiar with the library.
This allowed me to focus more on **clinical data interpretation and visualization clarity** rather than learning a new charting library during the exercise.

Chart.js also provides:

- flexible tooltip customization
- annotation capabilities
- lightweight bundle size

These features made it suitable for highlighting clinical thresholds and event details.

### Tailwind CSS

Tailwind provides a fast way to build clean UI layouts while keeping styles consistent and easy to maintain.

### Tailwind Plus UI Blocks

Tailwind UI blocks helped structure the dashboard layout quickly so that more time could be spent on **data visualization and interaction design**.

# Project Structure

The project follows a **feature-oriented structure** to keep related functionality grouped together and to make the application easier to scale as additional dashboard features are introduced.

```text
public/
  data.json

src/
 └── app/
      ├── features/
      │    └── dashboard/
      │         ├── dashboard-page/
      │         │     └── dashboard-page.component.ts
      │         │
      │         └── components/
      │               └── ui-components
      │
      ├── models/
      │    └── dose.model.ts
      │
      ├── services/
      │    └── adherence.service.ts
      │
      └── utils/
```

## public/

The data provided for the exercise is stored in the `public` folder as a JSON file.

This allows the application to simulate loading the data through an HTTP request, closely resembling how the frontend would interact with a backend API in a real production environment.

## features/dashboard

All dashboard-related functionality is grouped inside the `features/dashboard` folder.

This includes:

- the **main dashboard page**
- all **chart components**
- visualization logic specific to the clinical dashboard

This structure helps keep the application modular and makes it easier to add additional features in the future.

## dashboard-page

The `dashboard-page` component acts as the **parent container for the dashboard**.

Responsibilities include:

- loading the dataset
- coordinating data between child components
- composing the overall dashboard layout

The charts and event detail views are implemented as child components to keep the page component focused on orchestration rather than visualization logic.

## dashboard/components

This folder contains the **chart components** used in the dashboard.

Each chart is isolated into its own component to keep responsibilities clear and to make future reuse easier.

Examples include:

- adherence trend visualization
- technique quality chart
- event detail visualization

## models

The `models` folder contains TypeScript interfaces that represent the data structures used throughout the application.

These models ensure strong typing when working with inhaler events and technique metrics.

## services

The `services` layer is responsible for retrieving data from the JSON source and exposing it to the application as observables.

In a production environment this layer would communicate with a backend API.

## utils

Utility functions used across the application are placed in the `utils` folder.

Examples include:

- constants
- shared chart configuration helpers

# AI Tool Usage

ChatGPT (5.3) was used as a development assistant.

Specifically:

**AI assistance was used for:**

- generating the initial version of the **data mapper (`mapper.ts`)**
- helping draft sections of this **README**
- assisting with **Chart.js customization**, tooltip formatting and chart annotations

After the AI-generated suggestions were produced, I reviewed and refined them to ensure they aligned with the intended visualization and data model.

Using AI in this way helped accelerate development while still maintaining control over the final implementation.

---

# API Design (Production)

If this dashboard were backed by a production system, the data would be served by a **.NET API** responsible for retrieving inhaler events and technique metrics for a patient.

The API would be designed with **performance and payload efficiency in mind**, since adherence dashboards often require frequent reads of time-series data.

Additionally, the API should return data that is already prepared for analytical consumption. Whenever possible, the backend should handle transformations that would otherwise introduce duplicated logic across clients.

For example, event data should be:

- **sorted** (e.g., by timestamp)
- **grouped or tagged** with contextual information such as _morning_ or _evening_ doses
- **classified** based on thresholds (e.g., _good_, _acceptable_, _poor_)
- **flattened as much as possible** to avoid deeply nested structures that increase parsing complexity on the client

Derived calculations, such as adherence indicators or technique classifications, should ideally be computed on the backend. This ensures consistent interpretation across different clients and reduces processing overhead in the frontend.

---

## Endpoints

Rather than exposing a single generic endpoint, I would separate **controller medication** and **rescue medication** endpoints.

Controller inhalers are typically used **daily and consistently**, and therefore drive the **adherence visualization**. Because they are accessed more frequently by the dashboard, isolating them allows us to return a smaller and more optimized payload.

Rescue inhaler events are less frequent and often used during episodes, so they can be retrieved independently when needed.

### Controller Medication Events

```
GET /api/patients/{patientId}/controller-medications/{medicationId}/events
```

### Rescue Medication Events

```
GET /api/patients/{patientId}/rescue-medications/{medicationId}/events
```

This separation helps:

- reduce payload size for common queries
- simplify adherence calculations
- improve caching opportunities
- avoid unnecessary technique data when not needed

---

## Query Parameters

| Parameter        | Description                        |
| ---------------- | ---------------------------------- |
| startDate        | Filter events from this date       |
| endDate          | Filter events until this date      |
| page             | Pagination index                   |
| pageSize         | Number of events returned          |
| includeTechnique | Include detailed technique metrics |

Example request:

```
GET /api/patients/PAT-2847/controller-medications/MED-001/events?startDate=2024-01-01&endDate=2024-01-19
```

---

## Date Range Limitation

To protect the system from extremely heavy queries, the API would enforce a **maximum allowed date range**, for example **30 days per request**.

If a client attempted to request a larger range, the API would return a validation error.

This ensures:

- predictable query performance
- better API stability
- reduced risk of large time-series scans

---

## Response Model (Simplified)

C# model:

```csharp
public class MedicationDto
{
    public string Id { get; set; }
    public string PatientId { get; set; }
    public int Adherence {get; set; }
    public Schedule Schedule { get; set; }
    public List<DoseEvent> Events { get; set; }
}

public class DoseEvent
{
    public string Id { get; set; }
    public DateTime Timestamp { get; set; }
    public bool AdherenceTaken { get; set; }
    public TechniqueMetrics? Technique { get; set; }
}

public class TechniqueMetrics
{
    public int TechniqueScore { get; set; }
    public int ShakeDuration { get; set; }
    public int InspiratoryTime { get; set; }
}
```

---

# Performance and Scaling Considerations

In real-world healthcare systems, event datasets can grow quickly as patients generate inhaler usage events over time.

To ensure good performance at scale, several strategies could be applied.

### Pagination

Large event streams should be paginated to prevent excessive payload sizes.

### Response Filtering

Optional parameters such as `includeTechnique` allow clients to skip detailed technique data when only adherence metrics are needed.

### Date Range Constraints

Restricting requests to smaller time windows (e.g., 30 days) helps maintain predictable database performance.

---

## Caching Strategy

Historical inhaler event data is **immutable once recorded**, meaning past datasets do not change.

Because of this, the API could cache common query ranges such as:

- previous month
- last 30 days
- adherence summary datasets

These cached datasets could be stored in a **fast-access data store** such as:

- **Redis**
- **MongoDB**
- another optimized read database

This would allow the system to serve frequently requested datasets extremely quickly without repeatedly querying the primary event store.

---

## Healthcare Considerations

Since this data represents patient medication usage, the API must follow strict healthcare data protection practices.

Key considerations include:

### Data Security

- HTTPS enforced
- authentication and authorization
- role-based access control
- audit logging for sensitive data access

### Data Integrity

Clinical dashboards must avoid misleading insights.
Adherence calculations and threshold classification logic should ideally live **on the backend**, ensuring all clients interpret the data consistently.

### Observability

Monitoring and logging would be critical to detect abnormal patterns such as:

- spikes in API usage
- failed queries
- data pipeline issues

---

# Decisions and Trade-offs

### Chart Granularity

I focused on **clarity over density**.
While it would be possible to show many technique metrics simultaneously, this can overwhelm clinicians.

Instead, the charts highlight:

- trends
- technique patterns
- individual event details

### Data Transformation Layer

A small mapping layer was introduced between the raw JSON and the UI components because the JSON fields were not using a consistent casing convention.

The mapper normalizes the data structure and converts it into strongly typed models that are easier for the Angular components to consume.

---

# What I Would Do Next (3 More Hours)

If given additional time, I would prioritize the following improvements:

### 1. Date Range Filtering

Allow clinicians to explore adherence patterns across customizable time ranges instead of being limited to the fixed dataset window.

This would make it easier to analyze trends over longer periods and detect changes in patient behavior.

### 2. Additional Clinical Insights

Introduce additional analysis derived from the event data, for example:

- **Morning vs evening adherence comparison**
- **Detailed analysis of deviations from the expected dosing schedule window**

These insights could help clinicians quickly identify behavioral patterns such as delayed doses or inconsistent medication timing.

### 3. Accessibility Improvements

Although care was taken to use semantic HTML elements (such as proper sectioning, headings, and emphasis tags) and utilities like `sr-only`, there are still several areas where accessibility could be improved.

Examples include:

- improved keyboard navigation
- ARIA labels for chart elements
- better screen reader descriptions for data visualizations

### 4. Improved Clinical Summary Card

Add a clearer high-level summary panel that surfaces the most important signals for clinicians, such as:

- alerts for concerning adherence patterns
- technique quality trends
- quick patient adherence indicators
