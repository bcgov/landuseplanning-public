
### Aug 15, 2025
- If a shapefile is hidden on the main map, show a marker in its place [DESENG-874](https://citz-gdx.atlassian.net/browse/DESENG-874)

### Aug 8, 2025
- Fixed the small footer on the map page, as per Steve. [DESENG-865](https://citz-gdx.atlassian.net/browse/DESENG-865)

### Aug 6, 2025
- Optimized site load times and added a loading/welcome message for limited-speed users. [DESENG-872](https://citz-gdx.atlassian.net/browse/DESENG-872)
- Renamed misspelled component (activites > activities)
- Increased efficiency of font loading for outlined material icons
- Matched versions for all Leaflet dependencies
- Removed legacy icon fonts for IE and IOS 5

### Jul 24, 2025
- Updated the header/footer with improved design, accessibility, and inclusivity. [DESENG-865](https://citz-gdx.atlassian.net/browse/DESENG-865)
- Made all site content mobile compatible
- Adjusted margins of pages that were not aligned with header/footer
- Changed some page content to improve accessibility (contrast, inverse text)
- Added additional hover events for increased site interactivity
- Removed all instances of colonial blue
- Redesigned project contact info / contact button / subscribe button area to separate it from the footer
- Restructured SCSS for increased specificity and legibility
  - Changed any named colors like 'black' or 'white' to hex codes like '#000' or '#fff'
- Fixed image centering issue in hero banner
- Revised logic for scroll top button so that it uses Angular instead of jQuery
- Fixed invisible footer on map page, in mobile view

### Jul 9, 2025
- Added marker/centroid verification for project list map and individual project map [DESENG-839](https://citz-gdx.atlassian.net/browse/DESENG-839)

### Jul 3, 2025
- Restore use of the image picker in survey WYSIWYG editors [DESENG-866](https://citz-gdx.atlassian.net/browse/DESENG-866)
- Remove some commented-out CSS

### Jun 27, 2025

- Added 'participate now' button to engagement tab of individual project page. [DESENG-832](https://citz-gdx.atlassian.net/browse/DESENG-832)
  - Increased specificity of aria text for 'view details' and 'participate now' buttons
- Increased accessibility, updated styling, and removed blue colour from individual project page
  - Reworked tab component with clearer design language and higher contrast for accessibility
  - Set a minimum height to tab content, to avoid jarring height changes
  - Aligned all containers on page
  - Fixed some small styling inconsistencies and outdated html/css
  - Changed any buttons or link text from blue colours (decolonialized)

### Jun 24, 2025

- Changed instances of Submit Comment button text to Participate Now [DESENG-828](https://citz-gdx.atlassian.net/browse/DESENG-828)
- Added loading animation to hide map rendering. [DESENG-791](https://citz-gdx.atlassian.net/browse/DESENG-791)
  - Added utility function for measuring connection speed
  - Added custom typing for utility function
  - Added opacity to loading message and filters to background map, for visual feedback

### Jun 19, 2025

- Document the use of image tags in openshift Deployments. [DESENG-841](https://citz-gdx.atlassian.net/browse/DESENG-841)
- Added support for shape files from legacy projects on individual project page [DESENG-831](https://citz-gdx.atlassian.net/browse/DESENG-831)

### Jun 18, 2025

- Added an additional safeguard for shapefiles on the individual project page [DESENG-831](https://citz-gdx.atlassian.net/browse/DESENG-831)

### Jun 17, 2025

- Add option to hide shapefiles on the map page [DESENG-825](https://citz-gdx.atlassian.net/browse/DESENG-825)
- Fixed: Map was not loading on project page if a shapefile was missing [DESENG-831](https://citz-gdx.atlassian.net/browse/DESENG-831)
- Fixed: Project description pop-ups were off screen on the project map.

### Jun 12, 2025

- Cleaned up code for shapefile colour selection [DESENG-830](https://citz-gdx.atlassian.net/browse/DESENG-830)
  - Centralized file name URL encoding for consistent results
- Fixed critical issue with contrast ratio of mobile navigation
- Fixed layering of map objects so pins don't show up on top of pop-up messages
- Fixed filtering so that it correctly removes shapefiles (was previously redrawing on top of itself)

### June 5, 2025

- Modified logic branching for Submit Comment button on comment period page. [DESENG-829](https://citz-gdx.atlassian.net/browse/DESENG-829)

### May 22, 2025

- Backed up old and new yamls for production deployment [DESENG-767](https://citz-gdx.atlassian.net/browse/DESENG-767)

### May 15, 2025

- Fix shapefile incorrect ordering issue [DESENG-822](https://citz-gdx.atlassian.net/browse/DESENG-821)
- Update Changelog outdated Jira links

### May 13, 2025

- Fixed comment period page [DESENG-822](https://citz-gdx.atlassian.net/browse/DESENG-822)
  - Added ability to post external links to a comment period (was not previously working)
  - Restyled page as per ticket requirements
  - Restored proper banner URL functionality

### May 6, 2025

- Modified project list to include project filters [DESENG-799](https://citz-gdx.atlassian.net/browse/DESENG-799)
  - Increased contrast of project list hero banner for accessibility
  - Refactored code to remove many lines and improve performance of search/filter
  - Updated appearance of some dated components
  - Added URL param update logic for project types, for consistent state on refresh
  - Modified sorting logic to work properly with filter

### Apr 25, 2025

-  Add project-level shapefile colour reference to map page [DESENG-769](https://citz-gdx.atlassian.net/browse/DESENG-769)


### Apr 24, 2025

-  Allow for multiple, overlapping shapefiles on the map search page and project pages. [DESENG-769](https://citz-gdx.atlassian.net/browse/DESENG-769)


### Apr 14, 2025

- Added file attachment functionality to the contact form, which can be enabled/disabled by admins. [DESENG-789](https://citz-gdx.atlassian.net/browse/DESENG-789)

### Apr 10, 2025

- Fixed several screen reader accessibility issues in the project list page. [DESENG-788](https://citz-gdx.atlassian.net/browse/DESENG-788)
- Fixed issue with the comment period page not showing the banner image. [DESENG-790](https://citz-gdx.atlassian.net/browse/DESENG-790)
  - Updated .tool-versions to use Node 14.15.0
  - Increased strictness of sorting and pagination in project document tab.

### Mar 31, 2025

- Minor code changes to improve sorting and checks on project list page. [DESENG-786](https://citz-gdx.atlassian.net/browse/DESENG-786)
- Fixed date functionality for external links/files. [DESENG-787](https://citz-gdx.atlassian.net/browse/DESENG-787)

### Mar 27, 2025

- Implemented dynamic project phase options based on project type selection. [DESENG-780](https://citz-gdx.atlassian.net/browse/DESENG-780)
- Updated project map with visual feedback for search and filter updates. [DESENG-773](https://citz-gdx.atlassian.net/browse/DESENG-773)
- Added, updated, and organized Openshift pipeline and listener yamls. [DESENG-776](https://citz-gdx.atlassian.net/browse/DESENG-776)
- Added health check route. [DESENG-776](https://citz-gdx.atlassian.net/browse/DESENG-776)

### Mar 11, 2025

- Added BC Basemap layer to project list map and individual project maps. [DESENG-770](https://citz-gdx.atlassian.net/browse/DESENG-770)
- Fixed the missing 'Ocean Base' layer.
- Fixed zooming for markers on individual project pages.
- Updated Leaflet to version 1.5.0.

### Feb 27, 2025

- Disabled bound/zoom reseting after a filter is changed on the project map. [DESENG-771](https://citz-gdx.atlassian.net/browse/DESENG-771)

### Feb 13, 2025

- Added old deploymentConfig YAML and new Kubernetes deployment YAML to the Openshift folder (dev environment). [DESENG-762](https://citz-gdx.atlassian.net/browse/DESENG-762)
- Added old deploymentConfig YAML and new Kubernetes deployment YAML to the Openshift folder (test environment). [DESENG-766](https://citz-gdx.atlassian.net/browse/DESENG-766)

### Jan 20, 2025

- Added ability to filter projects on map by project type. [DESENG-752](https://citz-gdx.atlassian.net/browse/DESENG-752)
- Fixed shapefile filtering for text and checkbox filters

### Jan 9, 2025

- External links added by admins will now show up in documents sections of projects, combined with internal files. [DESENG-751](https://citz-gdx.atlassian.net/browse/DESENG-751)
- Functionality supports sorting, pagination, and sections.
- Corrected wording in project list from Process Type(s) to Project Type(s).
- Custom collection notice will now show up in comment periods. [DESENG-754](https://citz-gdx.atlassian.net/browse/DESENG-754)

### Dec 11, 2024

- Added full compatibility for multiple shape files in a single project, using one or multiple zip files. [DESENG-750](https://citz-gdx.atlassian.net/browse/DESENG-750)

### Nov 27, 2024

- Agreements header is now invisible when no agreements are available. [DESENG-742](https://citz-gdx.atlassian.net/browse/DESENG-742)
- Shapefiles can now appear with custom colours on the main project map and the individual project map. [DESENG-743](https://citz-gdx.atlassian.net/browse/DESENG-743)
- The Project Phase column in the project list has been replaced with Process Type(s). It lists relevant project planning types. [DESENG-746](https://citz-gdx.atlassian.net/browse/DESENG-746)
- Custom collection notice will appear in contact and subscribe modals when available.  [DESENG-747](https://citz-gdx.atlassian.net/browse/DESENG-747)
- Updated "Learn More" routes to reflect their current content. [DESENG-748](https://citz-gdx.atlassian.net/browse/DESENG-748)

### September 4, 2024

- Remove link from project phases graphic [DESENG-701](https://citz-gdx.atlassian.net/browse/DESENG-701)

### August 21, 2024

- Update URL on forest planning page [DESENG-691](https://citz-gdx.atlassian.net/browse/DESENG-691)

### July 28, 2024

- Redirect landuseplanning to planninginpartnership domain [DESENG-536](https://citz-gdx.atlassian.net/browse/DESENG-536)
- Fix local build issue by inputting proper package.json version and removing build step
- Remove commented-out nginx config

### June 19, 2024

- Sign up for project updates form not working [DESENG-653](https://citz-gdx.atlassian.net/browse/DESENG-653)
- Restore "land use planning" page hero image, add FAQ page link [DESENG-652](https://citz-gdx.atlassian.net/browse/DESENG-652)

### June 17, 2024

- Fix bug where documents don't load completely alongside sections [DESENG-598](https://citz-gdx.atlassian.net/browse/DESENG-598)
- "Modernizing" page content update [DESENG-589](https://citz-gdx.atlassian.net/browse/DESENG-589)
- Final content changes [DESENG-641](https://citz-gdx.atlassian.net/browse/DESENG-641)

### April 10, 2024

- Refresh static site content [DESENG-537](https://citz-gdx.atlassian.net/browse/DESENG-537)

### Mar 11, 2024

- Add option for contact form on projects [DESENG-373](https://citz-gdx.atlassian.net/browse/DESENG-373)

### Jan 18, 2024

- Fix bug relating to documents tab pagination [DESENG-486](https://citz-gdx.atlassian.net/browse/DESENG-486)

### Oct 11, 2023

- Add file sections [DESENG-372](https://citz-gdx.atlassian.net/browse/DESENG-372)

### Sept 15, 2023

- Upgraded BC-Sans font to version 2.0. [DESENG-387](https://citz-gdx.atlassian.net/browse/DESENG-387)

### Jul 5, 2023

- Fixed project description images so that they are centre-aligned by default. [DESENG-359](https://citz-gdx.atlassian.net/browse/DESENG-359)

### Jun 15, 2023

- Updated Angular (version 11) and several packages to address security concerns. [DESENG-344](https://citz-gdx.atlassian.net/browse/DESENG-344)

### Mar 17, 2023

- Updated hero background image to new image of Revelstoke. [DESENG-291](https://citz-gdx.atlassian.net/browse/DESENG-291)

### Mar 9, 2023

- Added option to add/remove Activities and Updates section from project description page. [DESENG-283](https://apps.itsm.gov.bc.
  ca/jira/browse/DESENG-283)

### Feb 16, 2023

- Merging in new site style rebrand [DESENG-270](https://citz-gdx.atlassian.net/browse/DESENG-270)

### Oct 13, 2022

- Allow for individual tests to be run [DESENG-112](https://citz-gdx.atlassian.net/browse/DESENG-112)
- Clean up errors when running `ng test`(including testing projects for Decisions, which aren't used, and removing an unused pipe)

### May 25, 2022

- Render polygons on the main app map [DESENG-4](https://citz-gdx.atlassian.net/browse/DESENG-4)
- Remove regional districts column in projects list table [DESENG-136](https://citz-gdx.atlassian.net/browse/DESENG-136)

### April 7, 2022

- Wrapped image not showing correctly on public [DESENG-108](https://citz-gdx.atlassian.net/browse/DESENG-108)

### April 6, 2022

- Remove background info tab heading [DESENG-109](https://citz-gdx.atlassian.net/browse/DESENG-109)
- Only load documents on the documents project tab [DESENG-103](https://citz-gdx.atlassian.net/browse/DESENG-103)

### March 28, 2022

- Fix karma error when running tests [DESENG-92](https://citz-gdx.atlassian.net/browse/DESENG-92)

### March 28, 2022

- Replace deprecated node-sass with sass library [DESENG-93](https://citz-gdx.atlassian.net/browse/DESENG-93)

### February 11, 2022

- Added OpenShift templates for the Public pipeline
- Added Github action for tests and linting
- Increase font size for project tabs [DESENG-77](https://citz-gdx.atlassian.net/browse/DESENG-77)
- Remove "partner first nation(s)" from project page [DESENG-76](https://citz-gdx.atlassian.net/browse/DESENG-76)

### January 26, 2022

- Remove unnecessary console.log calls
- Add details and engagementLabel fields to projects.
- Add doc block comments.
- Remove unused function params, libraries, variables, etc.
- Remove old, commented-out code.

###

- Initial app build.
