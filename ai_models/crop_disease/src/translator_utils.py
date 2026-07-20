from deep_translator import GoogleTranslator

def translate_to_language(text, target_lang):
    """
    Translates text to the target language using deep-translator.
    If target_lang is 'en' or invalid, returns original text.
    Supported target_langs for this project: 'en', 'gu', 'hi'
    """
    if not text or not isinstance(text, str):
        return text
        
    if not target_lang or target_lang.lower() == 'en':
        return text
        
    try:
        # map our language codes to google translate codes if necessary
        lang_code = target_lang.lower()
        
        translator = GoogleTranslator(source='auto', target=lang_code)
        
        # Deep-Translator has a 5000 character limit per request.
        # For very long text, we should chunk it, but for our AI models it's fine.
        return translator.translate(text)
    except Exception as e:
        print(f"Translation Error: {e}")
        return text

def translate_dict(data_dict, target_lang, keys_to_translate=None):
    """
    Translates specific string values inside a dictionary.
    keys_to_translate: list of keys whose values should be translated.
    If keys_to_translate is None, it tries to translate all string values.
    """
    if not target_lang or target_lang.lower() == 'en':
        return data_dict
        
    translated_dict = data_dict.copy()
    
    for key, value in data_dict.items():
        if keys_to_translate and key not in keys_to_translate:
            continue
            
        if isinstance(value, str):
            translated_dict[key] = translate_to_language(value, target_lang)
        elif isinstance(value, list) and all(isinstance(i, str) for i in value):
            translated_dict[key] = [translate_to_language(i, target_lang) for i in value]
            
    return translated_dict
