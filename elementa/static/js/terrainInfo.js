const TerarinInfo = pc.createScript("terrainInfo");
TerarinInfo.attributes.add('skyboxTemplateName', { type: 'string' });
TerarinInfo.attributes.add('centroid', { type: 'vec3' });
TerarinInfo.attributes.add('portalLocation', { type: 'vec3' });
TerarinInfo.attributes.add('portalRotationEuler', { type: 'vec3' });
TerarinInfo.attributes.add('placePortalLandingPlatform', { type: 'boolean', default:false });
TerarinInfo.attributes.add('backgroundAudioSource', { type: 'object' });



