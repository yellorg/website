# How to connect Google auth?

To enable Google Auth for your project, you need to set up a Google OAuth application and add the application credentials to your Supabase Dashboard.

## Overview
Setting up Google logins for your application consists of 3 parts:

- Create and configure a Google Project on the [Google Cloud Platform Console](https://console.cloud.google.com/home/dashboard);
- Add your Google OAuth keys to your [Supabase Project](https://app.supabase.com/);
- Add the login code to your Supabase JS Client App (already done by developers team).

## Steps

#### Access your Google Cloud Platform account

- Go to [cloud.google.com](https://cloud.google.com/).
- Click on `Sign in` at the top right to log in.

#### Create a Google Cloud Platform Project
- Click on `Select a Project` at the top left;
  - (Or, if a project is currently selected, click on the current project name at the top left.).
- Click `New Project` at the top right;
- Fill in your app information, then click Create;
  - (This can take a few minutes.).
- This should bring you to the dashboard for your new project.

#### Create the OAuth Keys for your project
From your project's dashboard screen:

- In the search bar at the top labeled `Search products and resources` type `OAuth`;
- Click on `OAuth consent screen` from the list of results;
- On the `OAuth consent screen` page select `External`;
- Click `Create`.

#### Edit your app information

- On the `Edit app registration` page fill out your app information;
- Click `Save and continue` at the bottom.

#### Find your callback URI

The next step requires a callback URI, which looks like this:
```https://<project-ref>.supabase.co/auth/v1/callback```

- Go to your [Supabase Project Dashboard](https://app.supabase.com/);
- Click on the `Settings` icon at the bottom of the left sidebar;
- Click on `API` in the list;
- Under Config / URL you'll find your API URL, you can click `Copy` to copy it to the clipboard;
- Now just add `/auth/v1/callback` to the end of that to get your full OAuth Redirect URI.
![Supabase](./images/supabase.png "Supabase")

#### Create your credentials

- Click `Credentials` at the left to go to the `Credentials` page;
- Click `Create Credentials` near the top then select `OAuth client ID`;
- On the `Create OAuth client ID` page, select your application type. If you're not sure, choose `Web application`;
- Fill in your app name;
- At the bottom, under `Authorized redirect URIs` click Add URI;
- Enter your callback URI under `Authorized redirect URIs` at the bottom;
- Enter your callback URI in the `Valid OAuth Redirect URIs` box;
- Click `Save Changes` at the bottom right;
- Click `Create`.

Copy your new OAuth credentials

- A box will appear called `OAuth client created`;
- Copy and save the values under `Your Client ID` and `Your Client Secret`.

#### Enter your Google credentials into your Supabase Project

- Go to your Supabase Project Dashboard;
- In the left sidebar, click the `Authentication` icon (near the top);
- Click `Settings` from the list to go to the `Authentication Settings` page;
- Enter the final (hosted) URL of your app under `Site URL` (this is important);
- Under `External OAuth Providers` turn `Google Enabled` to ON;
- Enter your `Google Client ID` and `Google Client Secret` saved in the previous step;
- Click `Save`.


Usefull links:
- [Supabase Authentication: Setting up Google Auth](https://youtu.be/dE2vtnv83Fc)