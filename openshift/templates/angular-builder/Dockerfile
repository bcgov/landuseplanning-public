# Get community edition of nodejs v10.x (LTS)
FROM image-registry.apps.silver.devops.gov.bc.ca/openshift/nodejs:16-ubi8

# Switch to root for package installs
USER 0

# Restore permissions
RUN chown -R 1001:0 /opt/app-root/src && \
    chmod -R ug+rwx /opt/app-root/src

# Run container by default as user with id 1001 (default)
USER 1001
