import unittest

from app.services.complaint_translation_service import _parse_translation


class ComplaintTranslationTests(unittest.TestCase):
    def test_parses_complete_multilingual_copy(self):
        result = _parse_translation('{"title_en":"Water leak","description_en":"Water is leaking.","title_hi":"पानी का रिसाव","description_hi":"पानी रिस रहा है।","title_mr":"पाण्याची गळती","description_mr":"पाणी गळत आहे."}')
        self.assertEqual("Water leak", result["title_en"])
        self.assertEqual("पाण्याची गळती", result["title_mr"])

    def test_rejects_partial_or_formatted_output(self):
        self.assertEqual({}, _parse_translation("not json"))
        self.assertEqual({}, _parse_translation('{"title_en":"Only one field"}'))


if __name__ == "__main__":
    unittest.main()
