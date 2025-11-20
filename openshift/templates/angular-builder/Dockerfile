# Get nodejs version 16 ubi8 from local OpenShift image registry
FROM image-registry.apps.silver.devops.gov.bc.ca/openshift/nodejs:16-ubi8

# Switch to root for package installs
USER 0

# Install dependencies
RUN microdnf install -y \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-misc \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    nss \
    && microdnf update nss -y \
    && microdnf clean all

# Restore permissions
RUN chown -R 1001:0 /opt/app-root/src && \
    chmod -R ug+rwx /opt/app-root/src

# Run container by default as user with id 1001 (default)
USER 1001
