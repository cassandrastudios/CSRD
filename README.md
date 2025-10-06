# CSRD Co-Pilot

A comprehensive SaaS web application that helps small and mid-sized companies prepare for the **Corporate Sustainability Reporting Directive (CSRD)** process, including onboarding, data collection, and AI-assisted reporting.

## 🚀 Features

### Core Functionality
- **Onboarding**: Simple company setup with sector, employee count, and reporting year
- **Roadmap Dashboard**: Visual progress tracking through CSRD milestones
- **Materiality Assessment**: Interactive ESRS topic assessment with dual-axis sliders
- **Data Collection Hub**: ESG metrics management with status tracking
- **Report Builder**: Rich text editor with AI-powered content generation
- **Compliance Check**: Real-time compliance monitoring and requirements tracking
- **Settings**: Organization management and API key configuration

### Technical Features
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL via Supabase with real-time subscriptions
- **AI Integration**: OpenAI GPT API for content generation (placeholder)
- **Charts**: Interactive materiality matrix using Recharts
- **UI Components**: Modern design with Tailwind CSS and shadcn/ui
- **Responsive**: Mobile-first design for all screen sizes

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd csrd-co-pilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   AI_SDK_KEY=your_vercel_ai_sdk_key_here
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/20240101000001_initial_schema.sql`
   - Enable Row Level Security (RLS) policies as needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

### Core Tables
- **organizations**: Company information and settings
- **esrs_topics**: ESRS topic definitions and categories
- **materiality_assessments**: Materiality assessment results
- **esg_metrics**: ESG data collection tracking
- **report_sections**: Report content and drafts

### Key Relationships
- Organizations have many materiality assessments
- Organizations have many ESG metrics
- Organizations have many report sections
- ESRS topics are referenced by assessments and report sections

## 🎯 Usage

### Getting Started
1. **Sign Up**: Create an account with email/password
2. **Onboarding**: Complete company information setup
3. **Materiality Assessment**: Assess ESRS topics for materiality
4. **Data Collection**: Set up and track ESG metrics
5. **Report Building**: Create CSRD-compliant report sections
6. **Compliance Check**: Monitor progress against requirements

### Key Workflows
- **Materiality Assessment**: Use dual sliders to assess impact and financial materiality
- **Data Collection**: Add metrics, assign owners, track completion status
- **Report Building**: Create sections with AI assistance and rich text editing
- **Compliance Monitoring**: Track progress across all CSRD requirements

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migration SQL
3. Set up authentication policies
4. Configure storage buckets for file uploads

### OpenAI Integration
1. Get an OpenAI API key
2. Add to environment variables
3. Implement AI functions in `src/lib/ai.ts` (placeholder)

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── materiality/       # Materiality assessment
│   ├── data/              # Data collection hub
│   ├── report/            # Report builder
│   ├── compliance/        # Compliance check
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
├── types/                # TypeScript type definitions
└── integrations/         # External service integrations
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment with database
- **AWS**: Use Amplify or custom EC2 setup

## 🔒 Security

- **Authentication**: Supabase Auth with secure session management
- **Database**: Row Level Security (RLS) policies
- **API Keys**: Environment variable protection
- **Data Validation**: Zod schema validation
- **HTTPS**: Enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core CSRD workflow implementation
- ✅ Basic AI integration placeholder
- ✅ Materiality assessment tools
- ✅ Data collection management

### Phase 2 (Planned)
- 🔄 Advanced AI content generation
- 🔄 Team collaboration features
- 🔄 Advanced reporting templates
- 🔄 Integration with external data sources

### Phase 3 (Future)
- 🔄 Automated compliance checking
- 🔄 Advanced analytics and insights
- 🔄 Multi-language support
- 🔄 Mobile application

---

**Built with ❤️ for CSRD compliance**