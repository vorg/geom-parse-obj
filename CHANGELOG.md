# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# [2.1.0](https://github.com/vorg/geom-parse-obj/compare/v2.0.0...v2.1.0) (2026-10-09)

### Bug Fixes

* align uvs and normals with positions in groups with partial attributes ([996bd9a](https://github.com/vorg/geom-parse-obj/commit/996bd9a4055aaf42ab5f56a18712160a05ddd3f9))
* align vertex colors with positions ([8da589a](https://github.com/vorg/geom-parse-obj/commit/8da589a2fe5d7a7f0d9d9e96cb12edc9e7195aab))
* append faces to existing group when its name is redeclared ([a742f3e](https://github.com/vorg/geom-parse-obj/commit/a742f3e40fc01556ff29a4e6fd41389555c5708b))
* default missing vt v coordinate to 0 ([010c083](https://github.com/vorg/geom-parse-obj/commit/010c083fa23441dafd27389841b27a51c7622861))
* name unnamed group "default" ([ecd4a7b](https://github.com/vorg/geom-parse-obj/commit/ecd4a7bcc19a34a92d9e968aa4ad83d5d7b9f66d))
* resolve relative face indices at parse time ([9e8d5c8](https://github.com/vorg/geom-parse-obj/commit/9e8d5c8a1b70ba44b3f7164527747d3143916ce6))
* skip faces with invalid vertex indices ([d2a5557](https://github.com/vorg/geom-parse-obj/commit/d2a5557be7e95a43dfbc9148234579b90c69a3cc))
* skip groups without faces ([7968a00](https://github.com/vorg/geom-parse-obj/commit/7968a00ae4748d322c03a9d1e92486b5aadfadc6))
* support line continuation with trailing backslash ([f0ec9ca](https://github.com/vorg/geom-parse-obj/commit/f0ec9ca51b08ccd9cf225ad91ce8da1598229cd0))

### Features

* add support for vertex colors ([93a99ea](https://github.com/vorg/geom-parse-obj/commit/93a99eab3c2b6e1ddba6ea442561433329810ee1))
* log issues once ([4adba2e](https://github.com/vorg/geom-parse-obj/commit/4adba2e83f39273060656be79f452f075d35510b))
* support object statement as group ([a9cbfa0](https://github.com/vorg/geom-parse-obj/commit/a9cbfa00803695e0fbbe1fbc776ae5bebe0de826))

# 2.0.0 (2023-02-16)


### Features

* add support for typed array geometries ([1819437](https://github.com/vorg/geom-parse-obj/commit/1819437dca00a8d26962a05860a1c014818f2907))
* return an array of geometry in every case ([469cb88](https://github.com/vorg/geom-parse-obj/commit/469cb88e90e62911db93f2802f68dbe61337711f))


### BREAKING CHANGES

* use ESM
