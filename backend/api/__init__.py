"""
TeachAssist API Package

This __init__.py ensures pydantic compatibility patches are applied
BEFORE any other imports that might trigger chromadb.
"""

# CRITICAL: This must run before ANY chromadb import
# Monkey-patch pydantic to support ChromaDB with Pydantic v2
try:
    import pydantic
    from pydantic_settings import BaseSettings
    from pydantic import ConfigDict

    # 1. ChromaDB expects BaseSettings in pydantic module
    #    In Pydantic v2, it moved to pydantic-settings
    if not hasattr(pydantic, 'BaseSettings'):
        setattr(pydantic, 'BaseSettings', BaseSettings)

    # 2. Make Pydantic v2 more permissive for ChromaDB's internal models
    #    ChromaDB has un-annotated attributes that Pydantic v2 rejects
    import os
    os.environ.setdefault('PYDANTIC_V2_PERMISSIVE', '1')

    # 3. Globally configure Pydantic to allow un-annotated attributes
    #    This is needed for ChromaDB's Settings class
    if not hasattr(pydantic, '_original_model_config'):
        pydantic._original_model_config = pydantic.ConfigDict

        def permissive_config(*args, **kwargs):
            """Wrap ConfigDict to be more permissive for ChromaDB."""
            kwargs.setdefault('arbitrary_types_allowed', True)
            kwargs.setdefault('extra', 'allow')
            return pydantic._original_model_config(*args, **kwargs)

        pydantic.ConfigDict = permissive_config

except ImportError:
    # pydantic-settings not available
    pass
